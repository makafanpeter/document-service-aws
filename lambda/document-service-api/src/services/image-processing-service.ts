import {Rekognition} from "aws-sdk";
import {FaceCriteria} from "../models/face-criteria";

class ImageProcessingService {

    private rekognition! : Rekognition;
    private readonly region!: string;
    constructor() {
        this.region = process.env.REGION as  string;
        this.rekognition = new Rekognition({
            region: this.region
        });
    }

    /**
     *
     * @param file
     * @param criteria
     */
    detectFace = async (file:Buffer, criteria:FaceCriteria): Promise<boolean> =>{

        return true;
    }

    /**
     *
     * @param source
     * @param target
     */
    compareFace = async (source: Buffer, target:Buffer):Promise<boolean> =>{


        return true;
    }
}


export default  ImageProcessingService;