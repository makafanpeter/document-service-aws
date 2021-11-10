export interface EnvironmentVariableProps {
    documentsTable: string,
    region: string,
    bucket: string

}


export class EnvironmentVariables implements EnvironmentVariableProps {
    constructor(documentsTable: string, bucket: string, region: string) {
        this.documentsTable = documentsTable;
        this.bucket = bucket;
        this.region = region;
    }

    public documentsTable: string;
    public bucket: string;
    public region: string;
}