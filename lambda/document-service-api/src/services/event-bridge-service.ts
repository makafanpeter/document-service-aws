import {EventBridge} from 'aws-sdk'
import IEvent from '../models/event'
import {DomainError} from "../models/errors/domain-error";
import {PutEventsRequest} from "aws-sdk/clients/eventbridge";
import {v4} from "uuid";
import log from "../utilities/log";

class EventBridgeService {

    private eventBridge!: EventBridge;
    private readonly region!: string;
    private readonly eventBusName: string;

    constructor(eventBusName: string) {
        this.region = process.env.REGION as  string;
        this.eventBusName = eventBusName;
        this.initializeAWS();
    }

    private initializeAWS() {
        this.eventBridge = new EventBridge({
            region: this.region
        });
    }

  /**
   *
   */
    publish = async (event: IEvent,
                     type: string,
                     source: string): Promise<void> => {

        const command :PutEventsRequest  = {
            Entries : [
                {
                    Detail: JSON.stringify(event),
                    EventBusName :this.eventBusName,
                    DetailType : type,
                    Source : source,
                    Time:  new Date(),
                    TraceHeader: v4()
                }
            ]
        };
        const result = await this.eventBridge.putEvents(command).promise().catch(e => {
            throw new DomainError("SYSTEM_ERROR", e.message);
        });
        log.info(`Event Bridge result: ${JSON.stringify(result)}`);
        if (!!result.FailedEntryCount && result.FailedEntryCount > 0) {
            log.error(`Event Bridge result error: ${JSON.stringify(result)}`);
            throw new DomainError("Failure", 'Internal error.');
        }
    }



}

export default  EventBridgeService;