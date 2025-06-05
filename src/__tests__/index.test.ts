import { describe, it, expect } from 'vitest';
import { ittfPingPong } from '../index';
import { beforeEach } from 'node:test';

describe('ittfPingPong', () => {
    it('should create an instance', () => {
    const client = new ittfPingPong();
    expect(client).toBeInstanceOf(ittfPingPong);
    });
    describe('currentRankings', () => {
        let client = new ittfPingPong();
        beforeEach(async () => {
             client = new ittfPingPong();
        }
        )

        it('should fetch the specified number of rows, and the data should contain a name, a rank, an associated country, and a points total per row', async () => {

            
            
            const data = await client.currentRankings('SEN', 'M', 'S', 100) as Rankings ;
            console.log(data[data.length-1]);
            
            expect(data.length).toBe(100);
            expect(data[data.length-1]).toHaveProperty("name");
            expect(data[data.length-1]).toHaveProperty("rank");
            expect(data[data.length-1]).toHaveProperty("assoc");
            expect(data[data.length-1]).toHaveProperty("points");
            expect(data[data.length-1].rank).toBe("100");
        }, 50000 );

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
        }, 50000);
    });
});