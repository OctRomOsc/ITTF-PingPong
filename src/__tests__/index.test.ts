import { describe, it, expect, beforeAll } from 'vitest';
import { ittfPingPong } from '../index';
import { beforeEach } from 'node:test';

describe('ittfPingPong', () => {
    it('should create an instance', () => {
    const client = new ittfPingPong();
    expect(client).toBeInstanceOf(ittfPingPong);
    });
    describe('currentRankings', () => {
        const client = new ittfPingPong();

        it('should fetch the specified number of rows, and the data should contain a name, a rank, an associated country, and a points total per row', async () => {

            
            
            const data = await client.currentRankings('SEN', 'M', 'S', 100) as Rankings ;
            console.log(data[data.length-1]);
            
            expect(data.length).toBe(100);
            expect(data[data.length-1]).toHaveProperty("name");
            expect(data[data.length-1]).toHaveProperty("rank");
            expect(data[data.length-1]).toHaveProperty("assoc");
            expect(data[data.length-1]).toHaveProperty("points");
            expect(data[data.length-1].rank).toBe("100");
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

        it('should return a Rankings array with a length above 1000 (default value for topN is "all")', async () => {

            const data = await client.currentRankings('SEN', 'M', 'S') as Rankings ;
            expect(data.length).toBeGreaterThan(1000);
        });

        it('should throw an error for using a non-positive integer or a float as the topN parameter', async () => {

            await expect(client.currentRankings('SEN', 'M', 'S', -1)).rejects.toThrow('topN must be a positive integer or "all"') ;
            await expect(client.currentRankings('SEN', 'M', 'S', 0.5)).rejects.toThrow('topN must be a positive integer or "all"') ;
            await expect(client.currentRankings('SEN', 'M', 'S', -0.5)).rejects.toThrow('topN must be a positive integer or "all"') ;
            
        });
    });

    describe('playerIttfId', () => {
        const client = new ittfPingPong();
        

        it("should fetch the player's IttfId providing their full name", async () => {

            
            
            const data = await client.playerIttfId({playerFullName:'FAN Zhendong'});
            console.log(data);
            
            expect(data).toBe(121404);
        } );

        it("should fetch an array containing IttfIds for players that share a family name", async () => {

            
            const data = await client.playerIttfId({playerFamilyName:'LEBRUN'}) as object[];
            console.log(data.length);
            
            expect(data.length).toBeGreaterThan(3);
        });

        it("should properly execute a family name search even if the family name is typed in without all caps", async () => {

            
            const data = await client.playerIttfId({playerFamilyName:'leBruN'}) as object[];
            console.log(data.length);
            
            expect(data.length).toBeGreaterThan(3);
        });

        it("should fetch an array containing IttfIds for players that share a given name", async () => {

            
            const data = await client.playerIttfId({playerGivenName:'Carlos'}) as object[];
            console.log(data.length);
            
            expect(data.length).toBeGreaterThan(50);
        });

        it("should properly execute a given name search even if the given name is typed in without capitalizing the first letter", async () => {

            
            const data = await client.playerIttfId({playerGivenName:'caRlOs'}) as object[];
            console.log(data.length);
            
            expect(data.length).toBeGreaterThan(50);
        });


        it("should throw an error if numbers or special, non-Roman alphabet characters are used", async () => {

            
            
            await expect(client.playerIttfId({playerFullName:'FAN Zhengdong123'})).rejects.toThrow();
            
            
        });

        it("should throw an error if the user tries to input with more than one searchName type", async () => {

            await expect(client.playerIttfId({playerFullName:'FAN Zhengdong', playerFamilyName:"FAN"} as any)).rejects.toThrow("Only one of playerFullName, playerGivenName, or playerFamilyName should be provided");

        });

    });

    describe('playerProfile', () => {
        const client = new ittfPingPong();

        it("should fetch the player's profile including their yearly match record totals", async () => {

            
            
            const data = await client.playerProfile({playerFullName:'FAN Zhendong'});
            console.log(data);
            
            expect(data).toHaveProperty("player");
        } );
        

        it("should throw an error if the user tries to input with more than one searchMethod type", async () => {

            await expect(client.playerProfile({playerFullName :'FAN Zhengdong', playerIttfId : 121404} as any)).rejects.toThrow("Only one of playerFullName or IttfId should be provided");

        });



        it("should throw an error if numbers or special, non-Roman alphabet characters are used with playerFullName search", async () => {

            
            
            await expect(client.playerProfile({playerFullName:'FAN Zhengdong123'})).rejects.toThrow();
            
            
        });

        it("should throw an error if a non-positive integer or a float is input as playerIttfId", async () => {

            await expect(client.playerProfile({playerIttfId : -50})).rejects.toThrow("Invalid ittfID! Format must be 0-6 digit integer.");
            await expect(client.playerProfile({playerIttfId : 0.5})).rejects.toThrow("Invalid ittfID! Format must be 0-6 digit integer.");
            await expect(client.playerProfile({playerIttfId : -0.5})).rejects.toThrow("Invalid ittfID! Format must be 0-6 digit integer.");

        });
        


        
    });
});