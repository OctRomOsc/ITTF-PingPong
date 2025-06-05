import jsdom from "jsdom";
import getWeek from "./getWeek";



export class ittfPingPong {
    private currentRankingsUrl: string = 'https://www.ittf.com/wp-content/uploads';
    public static currentGender = ['M', 'W', 'X'] as const; // Man, woman, mixed (doubles only)
    public static currentCategory = ['S', 'D', 'DI'] as const; // Singles, doubles ranking (pairs), doubles ranking (individual)
    public static currentType = ['YOU', 'SEN'] as const; // All 3 youth competition types lumped together, Seniors


    static isValidGender(value: any): value is typeof ittfPingPong.currentGender[number] {
        return (this.currentGender as readonly string[]).includes(value);
    }

    static isValidCategory(value: any): value is typeof ittfPingPong.currentCategory[number] {
        return (this.currentCategory as readonly string[]).includes(value);
    }

    static isValidType(value: any): value is typeof ittfPingPong.currentType[number] {
        return (this.currentType as readonly string[]).includes(value);
    }

    private isPositiveInteger(n: number): n is number {
        return Number.isInteger(n) && n > 0;
        }

    /**
   * Fetch the current rankings.
   * @param type - The type of rankings ('YOU' | 'SEN') All 3 youth competition types lumped together (U15, U18, U21), Seniors
   * @param gender - Gender ('M' | 'W' | 'X') Man, woman, mixed (doubles only)
   * @param category - Category ('S' | 'D' | 'DI') Singles, doubles ranking (pairs), doubles ranking (individual)
   * @param topN - Only positive integers (e.g., 1, 2, 3, ...) or 'all'. Defaults to 'all'.
   */
    
    async currentRankings( type: typeof ittfPingPong.currentType[number],
         gender: typeof ittfPingPong.currentGender[number],
          category: typeof ittfPingPong.currentCategory[number],
           topN : number | 'all' ='all') : Promise<Rankings> {
        try {

            // Validate 'type'
            if (!ittfPingPong.isValidType(type)) {
                throw new Error(`Invalid type: ${type}. Valid options are: ${ittfPingPong.currentType.join(', ')}`);
            }

            // Validate 'gender'
            if (!ittfPingPong.isValidGender(gender)) {
                throw new Error(`Invalid gender: ${gender}. Valid options are: ${ittfPingPong.currentGender.join(', ')}`);
            }

            // Validate 'category'
            if (!ittfPingPong.isValidCategory(category)) {
                throw new Error(`Invalid category: ${category}. Valid options are: ${ittfPingPong.currentCategory.join(', ')}`);
            }
            if (topN !== 'all') {
                if (!this.isPositiveInteger(topN)) {
                  throw new Error('topN must be a positive integer or "all"');
                }
            }

            // Check for specific rule violation
            if (gender === 'X' && !['D', 'DI'].includes(category)) {
                throw new Error("Mixed gender ('X') requires a doubles category ('D' or 'DI').");
            }
            const currentDate : Date = new Date();
            const year : number = currentDate.getFullYear();
            const month : number = (currentDate.getMonth()+1)
            const monthStr : string = (String(month).length==1 ? '0'+ month : String(month));
            const week : number = getWeek();

            let endpointString : string = `/${year}/${monthStr}/${year}_${week}_${type}_${gender}${category}.html`
            
            
            let response : Response = await fetch(this.currentRankingsUrl+endpointString);
            let htmlText : string = await response.text();
            if (htmlText.includes("Not Found")){
                // Not found, subtract 1 from month
                const lastMonth : number = month - 1;
                const lastMonthStr = (String(lastMonth).length==1 ? '0'+ lastMonth : String(lastMonth));
                endpointString  = `/${year}/${lastMonthStr}/${year}_${week}_${type}_${gender}${category}.html`

                response = await fetch(this.currentRankingsUrl + endpointString);
                htmlText = await response.text();
                if (htmlText.includes("Not Found")) {
                    // Still not found, subtract 1 from week
                    const lastWeek = week - 1;
            
                    endpointString = `/${year}/${monthStr}/${year}_${lastWeek}_${type}_${gender}${category}.html`;
            
                    response = await fetch(this.currentRankingsUrl + endpointString);
                    htmlText = await response.text();
                
                    if (htmlText.includes("Not Found")) {
                    // Still not found, subtract 1 from week and 1 from month
                    
                    endpointString = `/${year}/${lastMonthStr}/${year}_${lastWeek}_${type}_${gender}${category}.html`;
            
                    response = await fetch(this.currentRankingsUrl + endpointString);
                    htmlText = await response.text();
                }
                }
            }
            const dom : jsdom.JSDOM = new jsdom.JSDOM(htmlText)
            const table : HTMLCollectionOf<HTMLTableSectionElement> = dom.window.document.getElementsByTagName("tbody")
            
            
            const rows : Array<Element> = Array.from(table[0].getElementsByClassName("rank"))
            
            const ranks : Rankings = rows.map(td => {
                return {rank : td.textContent!.trim(),
                     name : td.parentElement!.nextElementSibling!.textContent!.trim(),
                     assoc : td.parentElement!.parentElement?.getElementsByClassName("rcellc assoc")[0].textContent!.trim(),
                      points : td.parentElement!.nextElementSibling!.nextElementSibling!.nextElementSibling!.textContent!.trim()} as RankEntry})

            // Determine the maximum number of results
            const maxResults = ranks.length;

            // Set the limit
            const takeCount: number = topN === 'all' ? maxResults : Math.min(topN, maxResults);
            // Slice the results to top n
            const topRanks = ranks.slice(0, takeCount);

            return topRanks;
        } catch (err) {
            throw err;
          }
    };
    

};