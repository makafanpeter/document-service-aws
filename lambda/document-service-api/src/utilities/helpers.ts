class Helpers {



   public static getFileExtension = (filename: string) =>
    {
        let ext = /^.+\.([^.]+)$/.exec(filename);
        return ext == null ? "" : ext[1];
    }


    static EVENT_SOURCE:string ="document-service"

}

export default Helpers;