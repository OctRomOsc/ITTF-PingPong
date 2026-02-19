import { describe, it, expect, vi } from 'vitest';
import { ittfPingPong } from '../index';
import * as Cuimp from 'cuimp';


vi.mock('cuimp', async () => {
  const actual = await vi.importActual<typeof import('cuimp')>('cuimp');
  return {
    ...actual,
    // Replace the real function with a mock that defaults to the real one, so that only the few tests requiring mocks are affected
    createCuimpHttp: vi.fn(actual.createCuimpHttp), 
  };
});


describe('ittfPingPong', () => {
    it('should create an instance', () => {
    const client = new ittfPingPong();
    expect(client).toBeInstanceOf(ittfPingPong);
    });
    describe('currentRankings', () => {
        const client = new ittfPingPong();

        it("should fetch the specified number of entries and the player's rank should correspond to the entry index", async () => {

            
            
            const data = await client.currentRankings('SEN', 'M', 'S', 100) as Rankings ;
            
            
            expect(data.length).toBe(100);
            expect(data[data.length-1].CurrentRank).toBe("100");
        } );

        it('should throw an error for using an invalid input for the type parameter (Youth, Senior)', async () => {


            await expect(client.currentRankings('S' as any, 'M', 'S', 100)).rejects.toThrow('Invalid type: S. Valid options are: YOU, SEN');
    
        });

        it('should throw an error for using an invalid input for the gender parameter (M, W, X) or for using an invalid combination (X with single category S)', async () => {


            await expect(client.currentRankings('SEN', 'V' as any, 'S', 100)).rejects.toThrow('Invalid gender: V. Valid options are: M, W, X');
            await expect(client.currentRankings('SEN', 'X', 'S', 100)).rejects.toThrow("Mixed gender ('X') requires a doubles category ('D' or 'DI').");
        
        });

        it('should throw an error for using an invalid input for the category parameter (S, D, DI)', async () => {

            await expect(client.currentRankings('SEN', 'M', 'P' as any, 100)).rejects.toThrow('Invalid category: P. Valid options are: S, D, DI');
            
        });

        it('should return a Rankings array with a length of 100 (default value for topN is 100)', async () => {

            const data = await client.currentRankings('YOU', 'W', 'D') as Rankings ;
            expect(data.length).toBe(100);
            expect(data[data.length-1].CurrentRank).toBe("100");
        });

        it("should return a Rankings array even if the parameters are typed in without all caps", async () => {

            
            const data = await client.currentRankings('you' as any, 'w' as any, 'd' as any) as Rankings ;
            expect(data.length).toBe(100);
            expect(data[data.length-1].CurrentRank).toBe("100");
        });

        

        it('should return a Rankings array with a length above 1000', async () => {

            const data = await client.currentRankings('SEN', 'M', 'S', 'all') as Rankings ;
            expect(data.length).toBeGreaterThan(1000);
        }, 180000);

        it('should return a Rankings array with a length greater than 100 for each possible combination of query, for any positive integer above 100', async () => {
            
            let data = await client.currentRankings('SEN', 'M', 'S', 358) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('SEN', 'M', 'D', 201) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('SEN', 'M', 'DI', 333) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('YOU', 'M', 'S', 671) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('YOU', 'M', 'D', 159) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('YOU', 'M', 'DI', 511) as Rankings ;
            expect(data.length).toBeGreaterThan(100);

            data = await client.currentRankings('SEN', 'W', 'S', 711) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('SEN', 'W', 'D', 642) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('SEN', 'W', 'DI', 215) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('YOU', 'W', 'S', 876) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('YOU', 'W', 'D', 558) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('YOU', 'W', 'DI', 680) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            
            data = await client.currentRankings('SEN', 'X', 'D', 111) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('SEN', 'X', 'DI', 191) as Rankings ;
            expect(data.length).toBeGreaterThan(100);

            data = await client.currentRankings('YOU', 'X', 'D', 123) as Rankings ;
            expect(data.length).toBeGreaterThan(100);
            data = await client.currentRankings('YOU', 'X', 'DI', 300) as Rankings ;
            expect(data.length).toBeGreaterThan(100);

        }, 600000);

        it('should throw an error for using a non-positive integer or a float as the topN parameter', async () => {

            await expect(client.currentRankings('SEN', 'M', 'S', -1)).rejects.toThrow('topN must be a positive integer or "all"') ;
            await expect(client.currentRankings('SEN', 'M', 'S', 0.5)).rejects.toThrow('topN must be a positive integer or "all"') ;
            await expect(client.currentRankings('SEN', 'M', 'S', -0.5)).rejects.toThrow('topN must be a positive integer or "all"') ;
            
        });

        it('should throw an error for using a non-positive integer or a float as the requestDelay parameter', async () => {

            await expect(client.currentRankings('SEN', 'M', 'S', 100, -1)).rejects.toThrow('requestDelay must be a positive integer') ;
            await expect(client.currentRankings('SEN', 'M', 'S', 100, 0.5)).rejects.toThrow('requestDelay must be a positive integer') ;
            await expect(client.currentRankings('SEN', 'M', 'S', 100, -0.5)).rejects.toThrow('requestDelay must be a positive integer') ;
            
        });

        it('should throw an error if the frontdoor fetch fails due to network issues', async () => {

            // Mock fetch for network connection failure
            const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network Failure'));


            await expect(client.currentRankings('SEN', 'M', 'S', 100)).rejects.toThrow(`[ittf-pingpong] API Connection Error: Failed to fetch top 100`);
            fetchSpy.mockRestore();
        });


        

        it('should throw an error if the cuimp fetch fails immediately', async () => {
            
            const firewallBlockedResponse = {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'content-type': 'application/json'
                }
            };

            // Mock cuimp client get for 401 response from API
            vi.mocked(Cuimp.createCuimpHttp).mockReturnValue({
                get: vi.fn().mockResolvedValue(firewallBlockedResponse),
            } as any);

        

            await expect(client.currentRankings('SEN', 'M', 'S', 300)).rejects.toThrow('[ittf-pingpong] Request blocked by API Firewall: 401 Unauthorized at range 101-200. This usually happens due to high frequency. Try increasing requestDelay.');
            vi.mocked(Cuimp.createCuimpHttp).mockRestore();
        });


        it('should throw an error if the cuimp fetch fails due to network issues', async () => {
            

            // Mock cuimp client get for network connection failure
            vi.mocked(Cuimp.createCuimpHttp).mockReturnValue({
                get: vi.fn().mockRejectedValue(new Error('[ittf-pingpong] Network Failure')),
            } as any);

        

            await expect(client.currentRankings('SEN', 'M', 'S', 300)).rejects.toThrow('[ittf-pingpong] Network Failure');
            vi.mocked(Cuimp.createCuimpHttp).mockRestore();
        });
        
    });

    describe('playerIttfId', () => {
        const client = new ittfPingPong();
        

        it("should fetch the player's IttfId providing their full name", async () => {

            
            
            const data = await client.playerIttfId({playerFullName:'FAN Zhendong'}) as PlayerId[];
            
            expect(data[0].IttfId).toBe("121404");
        } );

        it("should fetch the player's IttfId even if their full name is not provided in the correct format", async () =>{

            const data = await client.playerIttfId({playerFullName:'FAN zhendong'}) as PlayerId[];

            expect(data[0].IttfId).toBe("121404");
        })

        it("should fetch an array containing IttfIds for players that share a family name", async () => {

            
            const data = await client.playerIttfId({playerFamilyName:'LEBRUN'}) as PlayerId[];
            
            
            expect(data.length).toBeGreaterThan(3);
        });

        it("should properly execute a family name search even if the family name is typed in without all caps", async () => {

            
            const data = await client.playerIttfId({playerFamilyName:'leBruN'}) as PlayerId[];
            
            
            expect(data.length).toBeGreaterThan(3);
        });

        it("should fetch an array containing IttfIds for players that share a given name", async () => {

            
            const data = await client.playerIttfId({playerGivenName:'Carlos'}) as PlayerId[];
            
            
            expect(data.length).toBeGreaterThan(50);
        });

        it("should properly execute a given name search even if the given name is typed in without capitalizing the first letter", async () => {

            
            const data = await client.playerIttfId({playerGivenName:'caRlOs'}) as PlayerId[];
            
            
            expect(data.length).toBeGreaterThan(50);
        });


        it("should throw an error if numbers or special, non-Roman alphabet characters are used", async () => {

            
            
            await expect(client.playerIttfId({playerFullName:'FAN Zhengdong123'})).rejects.toThrow("Input cannot contain any numbers or special characters, only roman alphabet characters A-Z/a-z.");
            
            
        });

        it("should throw an error if the user tries to input with more than one searchName type", async () => {

            await expect(client.playerIttfId({playerFullName:'FAN Zhengdong', playerFamilyName:"FAN"} as any)).rejects.toThrow("Only one of playerFullName, playerGivenName, or playerFamilyName should be provided");

        });

        it("should throw an error if the searched player's full name does not exist in the database", async () => {

            await expect(client.playerIttfId({playerFullName:'NAME Namename'})).rejects.toThrow(`[ittf-pingpong] Cannot find player's full name in the database. Ensure that family name comes first, followed by given name, and that there is a ranked ITTF player with this name (e.g. "ARUNA Quadri", and not "QUADRI Aruna")`)

        });

        it("should throw an error if the searched player's given name does not exist in the database", async () => {

            await expect(client.playerIttfId({playerGivenName:'Name'})).rejects.toThrow(`[ittf-pingpong] Cannot find given name in the database. Ensure that the spelling is correct and that there is a ranked ITTF player with this given name (e.g. "Hugo", for Hugo Calderano, Hugo Hanashiro, etc.)`)

        });

        it("should throw an error if the searched player's family name does not exist in the database", async () => {

            await expect(client.playerIttfId({playerFamilyName:'Name'})).rejects.toThrow(`[ittf-pingpong] Cannot find family name in the database. Ensure that the spelling is correct and that there is a ranked ITTF player with this family name (e.g. "Lebrun", for Alexis Lebrun, Félix Lebrun, etc.)`)

        });

        it('should throw an error if the fetch fails due to network issues', async () => {

            // Mock fetch for connection error
            const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network Failure'));


            await expect(client.playerIttfId({playerFullName:'FAN Zhendong'})).rejects.toThrow(`Network Failure`);
            fetchSpy.mockRestore();
        });

    });

    describe('playerProfile', () => {
        const client = new ittfPingPong();

        it("should fetch the player's profile from their full name including their yearly match record totals", async () => {

            
            
            const data = await client.playerProfile({playerFullName:'FAN Zhendong'});
            
            
            expect(data).toHaveProperty("player");
            expect(data).toHaveProperty("ranking");
            expect(data).toHaveProperty("stats");
        });

        it("should fetch the player's profile from their ittfId including their yearly match record totals", async () => {

            
            
            const data = await client.playerProfile({playerIttfId:121404});
            
            
            expect(data).toHaveProperty("player");
            expect(data).toHaveProperty("ranking");
            expect(data).toHaveProperty("stats");
        });

        it("should fetch the player's extended profile if includeExtendedDetails is true", async () => {

            
            
            const data = await client.playerProfile({playerFullName:'FAN Zhendong'},{includeExtendedDetails:true});
            
            
            expect(data.player).toHaveProperty("RacketColoringA");
  
        });
        

        it("should throw an error if the user tries to input with more than one searchMethod type", async () => {

            await expect(client.playerProfile({playerFullName :'FAN Zhengdong', playerIttfId : 121404} as any)).rejects.toThrow("Only one of playerFullName or IttfId should be provided");

        });



        it("should throw an error if numbers or special, non-Roman alphabet characters are used with playerFullName search", async () => {

            
            
            await expect(client.playerProfile({playerFullName:'FAN Zhengdong123'})).rejects.toThrow("[ittf-pingpong] Name cannot contain any numbers or special characters, only roman alphabet characters A-Z/a-z.");
            
            
        });

        it("should throw an error if a non-positive integer or a float is input as playerIttfId", async () => {

            await expect(client.playerProfile({playerIttfId : -50})).rejects.toThrow("Invalid ittfID! Format must be 0-6 digit integer.");
            await expect(client.playerProfile({playerIttfId : 0.5})).rejects.toThrow("Invalid ittfID! Format must be 0-6 digit integer.");
            await expect(client.playerProfile({playerIttfId : -0.5})).rejects.toThrow("Invalid ittfID! Format must be 0-6 digit integer.");

        });
        

        it("should throw an error if the searched player's full name does not exist in the database", async () => {

            await expect(client.playerProfile({playerFullName:'NAME Namename'})).rejects.toThrow(`[ittf-pingpong] Cannot find player's full name in the database. Ensure that family name comes first, followed by given name, and that there is a ranked ITTF player with this name (e.g. "ARUNA Quadri", and not "QUADRI Aruna")`)

        });

        it("should throw an error if the searched player's IttfId does not exist in the database", async () => {

            await expect(client.playerProfile({playerIttfId:1000000})).rejects.toThrow(`[ittf-pingpong] Cannot find player's IttfId in the database. Search using the player's Full Name or find for their IttfId with the playerIttfId method first.`)

        });

        it('should throw an error if the fetch fails due to network issues', async () => {

            // Mock fetch for connection error
            const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network Failure'));


            await expect(client.playerProfile({playerFullName:'FAN Zhendong'})).rejects.toThrow(`Network Failure`);
            fetchSpy.mockRestore();
        });

    });
});