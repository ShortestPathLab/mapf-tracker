export declare function parseMap(map: string): boolean[][];

export declare function parseMapMeta(map: string): {
    width: number;
    height: number;
    type: string;
};

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

export declare function parseScenarioMeta(scenarioData: string, agentCount?: number): {
    sources: {
        x: number;
        y: number;
    }[];
    goals: {
        x: number;
        y: number;
    }[];
    width: number;
    height: number;
};

export { }
