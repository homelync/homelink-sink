import { ConsumeMessage } from "amqplib";
import { inject, injectable } from "inversify";
import { TYPES } from "../global/types";
import { MqttDevice } from "../model/device";
import { SqlDbConnection } from "../forward/db/SqlDbConnection";
import { ServiceClient } from "./serviceClient";
import { ISnsClient } from "../forward/sns/snsClient";
import { configuration } from "../config/config";
import { Logger } from "../utility/logger";


@injectable()
export class AlertClient implements ServiceClient {

    constructor(@inject(TYPES.SqlDbConnection) private dbConnection: SqlDbConnection, @inject(TYPES.DeviceSnsClient) private snsClient: ISnsClient) {
    }

    async create(msg: ConsumeMessage, payload: MqttDevice) {

        if (configuration.alertActionType?.toLowerCase().includes('database')){
            Logger.debug(`Persisting to database ${configuration.store.database}`);
            await this.dbConnection.builder('homelink.alert').insert(payload);
        }

        if (configuration.alertActionType?.toLowerCase().includes('sns')){
            if (!configuration.sns.alert.topic){
                throw new Error('Alert sns topic not configured add environment variable SNS_ALET_TOPIC');
            }
            this.snsClient.publish(configuration.sns.alert.topic, payload);
        }
    }
}