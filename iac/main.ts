import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider, ecr, ecs, ec2, iam } from '@cdktf/provider-aws';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, 'aws', {});

    const vpc = new ec2.Vpc(this, 'vpc', {
      cidrBlock: '10.0.0.0/16'
    });

    const subnets = ['10.0.1.0/24', '10.0.2.0/24'].map((cidr, i) => new ec2.Subnet(this, `subnet-${i}`, {
      vpcId: vpc.id,
      cidrBlock: cidr,
      availabilityZone: `us-east-1${i === 0 ? 'a' : 'b'}`
    }));

    const repo = new ecr.EcrRepository(this, 'repo', {
      name: 'app-repo'
    });

    const cluster = new ecs.EcsCluster(this, 'cluster', {});

    const taskRole = new iam.IamRole(this, 'task-role', {
      name: 'task-role',
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { Service: 'ecs-tasks.amazonaws.com' },
          Action: 'sts:AssumeRole'
        }]
      })
    });

    const taskDef = new ecs.EcsTaskDefinition(this, 'task', {
      family: 'app-task',
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      cpu: '256',
      memory: '512',
      executionRoleArn: taskRole.arn,
      taskRoleArn: taskRole.arn,
      containerDefinitions: JSON.stringify([{
        name: 'app',
        image: `${repo.repositoryUrl}:latest`,
        essential: true,
        portMappings: [{ containerPort: 3000 }]
      }])
    });

    const service = new ecs.EcsService(this, 'service', {
      cluster: cluster.id,
      desiredCount: 1,
      launchType: 'FARGATE',
      taskDefinition: taskDef.arn,
      networkConfiguration: {
        subnets: subnets.map(s => s.id),
        assignPublicIp: true,
        securityGroups: []
      }
    });

    new TerraformOutput(this, 'repository_url', {
      value: repo.repositoryUrl
    });
  }
}

const app = new App();
new MyStack(app, 'app-stack');
app.synth();
