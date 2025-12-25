export declare class AppService {
    private genAI;
    private model;
    constructor();
    processText(text: string, instruction: string, mode: string): Promise<any>;
}
