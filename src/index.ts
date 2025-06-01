import jsdom from "jsdom";
import getWeek from "./getWeek";

type currentGender = 'M' | 'W' | 'X'; // Man, woman, mixed (doubles only)
type currentCategory = 'S' | 'D' | 'DI'; // Singles, doubles ranking (pairs), doubles ranking (individual)
type currentType = 'YOU' | 'SEN'; // All 3 youth competition types lumped together, Seniors

export interface RankEntry {
    name : string,
    rank : string,
    assoc : string,
    points : string
};

export type Rankings = RankEntry[];

export class ittfPingPong {
    private currentRankingsUrl: string = 'https://www.ittf.com/wp-content/uploads';
    
    async currentRankings( type: currentType, gender: currentGender, category: currentCategory, topN :number | 'all' ='all') {
        try {
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
            
            rows.pop()
            
            
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
            return "Error fetching ranking data.";
          }
    };

};