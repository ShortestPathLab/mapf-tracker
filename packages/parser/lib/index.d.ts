export declare function parseMap(map: string): boolean[][];

export declare function parseScenario(scenarioData: string, agentCount: number, solutionData: string): {
    paths: string[];
    sources: {
        x: number;
        y: number;
    }[];
    x: number;
    y: number;
    timespan: number;
    agents: string[];
};

export { }
