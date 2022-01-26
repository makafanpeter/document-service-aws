import {Rekognition} from "aws-sdk";
import {FaceCriteria} from "../models/face-criteria";
import {
    CompareFacesRequest,
    CompareFacesResponse,
    DetectFacesRequest,
    DetectFacesResponse
} from "aws-sdk/clients/rekognition";
import {BadRequestError, DomainError} from "../models/errors/domain-error";

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
     * @param faceCriteria
     */
    detectFace = async (file:Buffer, faceCriteria:FaceCriteria): Promise<boolean> =>{

        const params: DetectFacesRequest = {
            Image:{
                Bytes : file
            },
            Attributes:["ALL"]
        };
       const response: DetectFacesResponse   = await this.rekognition.detectFaces(params).promise().catch(error => {
            throw new DomainError("SYSTEM_ERROR", error.message);
        });

       let result = false;
       if (response.FaceDetails != undefined){
           result = true;
       }
       response.FaceDetails?.forEach((face) => {

           if (faceCriteria.eyeGlasses)
           {
               result = face.Eyeglasses?.Value == faceCriteria.eyeGlasses;
           }
           if (faceCriteria.eyesOpen)
           {
               result = face.EyesOpen?.Value == faceCriteria.eyesOpen;
           }
           if (faceCriteria.mouthOpen)
           {
               result = face.MouthOpen?.Value == faceCriteria.mouthOpen;
           }
           if (faceCriteria.sunGlasses)
           {
               result = face.Sunglasses?.Value == faceCriteria.sunGlasses;
           }
       });

        return result;
    }

    /**
     *
     * @param source
     * @param target
     */
    compareFace = async (source: Buffer, target:Buffer):Promise<boolean> =>{

        let result = false;
        const params: CompareFacesRequest = {
            SimilarityThreshold: 50,
            SourceImage: {
                Bytes : source
            },
            TargetImage: {
                Bytes: target
            }
        }

        const response: CompareFacesResponse   = await this.rekognition.compareFaces(params).promise().catch(error => {
           if (error.code ==  "InvalidParameterException"){
               throw new BadRequestError(error.message);
           }else{
               throw new DomainError("SYSTEM_ERROR", error.message);
           }
        });

        if (response.FaceMatches){
                result = true;
        }
        return result;
    }
}


export default  ImageProcessingService;