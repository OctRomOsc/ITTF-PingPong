import { describe, it, expect } from 'vitest';
import { ittfPingPong, Rankings } from '../index';

describe('ittfPingPong', () => {
    it('should create an instance', () => {
    const client = new ittfPingPong();
    expect(client).toBeInstanceOf(ittfPingPong);
    });
    describe('currentRankings', () => {

        it('should fetch the specified number of rows, and the data should contain a name, a rank, an associated country, and a points total per row', async () => {

            const client = new ittfPingPong();
            
            const data = await client.currentRankings('SEN', 'M', 'S', 100) as Rankings ;
            console.log(data[data.length-1]);
            
            expect(data.length).toBe(100);
            expect(data[data.length-1]).toHaveProperty("name");
            expect(data[data.length-1]).toHaveProperty("rank");
            expect(data[data.length-1]).toHaveProperty("assoc");
            expect(data[data.length-1]).toHaveProperty("points");
            expect(data[data.length-1].rank).toBe("100");
        }, 50000 );
    });
});