import { Container } from 'inversify';
import 'reflect-metadata';
import { connect as amqpConnect } from 'amqp-connection-manager';
import { RabbitConnectionManager, IRabbitConnectionManager } from './service/rabbitConnectionManager';
import { configuration } from './config/config';
import { TYPES } from './global/types';
import { RabbitConsumeConfig } from './config/rabbitConfig';
import { ServiceClient } from './client/serviceClient';
import { DeviceClient } from './client/deviceClient';
import { DeviceConsumer } from './deviceConsumer';
import { ConsumerBase } from './consumerBase';
import { SqlDbConnection } from './forward/db/SqlDbConnection';
import { AlertClient } from './client/alertClient';
import { AlertConsumer } from './alertConsumer';
import { DeviceSnsClient, ISnsClient } from './forward/sns/snsClient';

let DependencyInjectionContainer = new Container();

// Homelync Rabbit Connection
const rabbitUrl = configuration.rabbitHost.port
    ? `${configuration.rabbitHost.host}:${configuration.rabbitHost.port}`
    : configuration.rabbitHost.host;

    const protocol = configuration.rabbitHost.tls ? 'amqps://' : 'amqp://';

const amqpConnectionManager = amqpConnect([`${protocol}${configuration.rabbitHost.username}:${configuration.rabbitHost.password}@${rabbitUrl}/${configuration.rabbitHost.vhost}`]);
const rabbitConnectionManager = new RabbitConnectionManager(amqpConnectionManager, rabbitUrl!);

DependencyInjectionContainer.bind<SqlDbConnection>(TYPES.SqlDbConnection).to(SqlDbConnection);

DependencyInjectionContainer.bind<IRabbitConnectionManager>(TYPES.RabbitConnectionManager).toConstantValue(rabbitConnectionManager);

// Device
DependencyInjectionContainer.bind<RabbitConsumeConfig>(TYPES.DeviceRabbitConfig).toConstantValue(configuration.deviceConsume);
DependencyInjectionContainer.bind<ServiceClient>(TYPES.DeviceClient).to(DeviceClient);
DependencyInjectionContainer.bind<ConsumerBase>(TYPES.DeviceConsumer).to(DeviceConsumer);
DependencyInjectionContainer.bind<ISnsClient>(TYPES.DeviceSnsClient).to(DeviceSnsClient);

// Alert
DependencyInjectionContainer.bind<RabbitConsumeConfig>(TYPES.AlertRabbitConfig).toConstantValue(configuration.alertConsume);
DependencyInjectionContainer.bind<ServiceClient>(TYPES.AlertClient).to(AlertClient);
DependencyInjectionContainer.bind<ConsumerBase>(TYPES.AlertConsumer).to(AlertConsumer);
// DependencyInjectionContainer.bind<ISnsClient>(TYPES.AlertSnsClient).to(AlertSnsClient);

export { DependencyInjectionContainer };