import jsdom from "jsdom";
import getWeek from "./getWeek";



export class ittfPingPong {
    private currentRankingsUrl : string = 'https://www.ittf.com/wp-content/uploads';
    private historicalRankingsUrl : string = 'https://ranking.ittf.com/public/s/ranking/list?category=SEN&typeGender=M;SINGLES&year=2020&week=49&offset=0&size=10000'
    private allPlayersUrl : string =  'https://wttcmsapigateway-new.azure-api.net/ttu/Players/GetPlayers?limit=100000'
    private allCountriesUrl : string = 'https://ranking.ittf.com/public/s/countries/list'
    private playerProfileUrl : string = 'https://ranking.ittf.com/public/s/player/profile/'
    private playerMatchesUrl : string = 'https://ranking.ittf.com/public/s/player/matches/ittfId?offset=0&size=valueSize&ind=valueInd&dbl=valueDouble'
    public static currentGender = ['M', 'W', 'X'] as const; // Man, woman, mixed (doubles only)
    public static currentCategory = ['S', 'D', 'DI'] as const; // Singles, doubles ranking (pairs), doubles ranking (individual)
    public static currentType = ['YOU', 'SEN'] as const; // All 3 youth competition types lumped together, Seniors


    static isValidGender(value: any): value is typeof ittfPingPong.currentGender[number] {
        //Ensures that only 'M', 'W', 'X' is passed as an input
        return (this.currentGender as readonly string[]).includes(value);
    }

    static isValidCategory(value: any): value is typeof ittfPingPong.currentCategory[number] {
        //Ensures that only 'S', 'D', 'DI' is passed as an input
        return (this.currentCategory as readonly string[]).includes(value);
    }

    static isValidType(value: any): value is typeof ittfPingPong.currentType[number] {
        //Ensures that only 'YOU' or 'SEN' is passed as an input
        return (this.currentType as readonly string[]).includes(value);
    }

    private isPositiveInteger(n: number): n is number {
        //Ensures that only positive integers are passed as an input
        return Number.isInteger(n) && n > 0;
        }

    private isAlphabetic(str : string) {
        //Ensures that only Latin Alphabet characters (upper and lower case) and spaces are passed as an input
        return /^[A-Za-z\s]+$/.test(str);
      }

    /**
   * Fetch the current rankings.
   * @param {string} type - The type of rankings ('YOU' | 'SEN') All 3 youth competition types lumped together (U15, U18, U21), Seniors
   * @param {string} gender - Gender ('M' | 'W' | 'X') Man, woman, mixed (doubles only)
   * @param {string} category - Category ('S' | 'D' | 'DI') Singles, doubles ranking (pairs), doubles ranking (individual)
   * @param {number | string} topN - Only positive integers (e.g., 1, 2, 3, ...) or 'all'. Defaults to 'all'.
   */
    
    async currentRankings( type: typeof ittfPingPong.currentType[number],
         gender: typeof ittfPingPong.currentGender[number],
          category: typeof ittfPingPong.currentCategory[number],
           topN : number | 'all' = 'all') : Promise<Rankings> 
    {
        try {

            // Validate type
            if (!ittfPingPong.isValidType(type)) {
                throw new Error(`Invalid type: ${type}. Valid options are: ${ittfPingPong.currentType.join(', ')}`);
            }

            // Validate gender
            if (!ittfPingPong.isValidGender(gender)) {
                throw new Error(`Invalid gender: ${gender}. Valid options are: ${ittfPingPong.currentGender.join(', ')}`);
            }

            // Validate category
            if (!ittfPingPong.isValidCategory(category)) {
                throw new Error(`Invalid category: ${category}. Valid options are: ${ittfPingPong.currentCategory.join(', ')}`);
            }
            // Validate topN
            if (topN !== 'all') {
                if (!this.isPositiveInteger(topN)) {
                  throw new Error('topN must be a positive integer or "all"');
                }
            }

            // Check for invalid gender and category combination
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

    /**
   * Fetch the player's ittfId given their name.
   * @param playerFullName - Player's family name and given name. Ensure that the family name is capitalized and placed before the given name. (e.g. "FAN Zhendong", "CALDERANO Hugo")
   * @param playerGivenName - Player's given name(s) only.
   * @param playerFamilyName - Player's family name.
   * @param {Object} searchName - The name parameters, all mutually exclusive. I.E., you can only enter playerFullName, playerGivenName, or playerFamilyName.
   * @param {string} [searchName.playerFullName] - The full name, mutually exclusive with givenName and familyName.
   * @param {string} [searchName.playerGivenName] - Given name, mutually exclusive with fullName.
   * @param {string} [searchName.playerFamilyName] - Family name, mutually exclusive with fullName.
   *
   * @throws {Error} When multiple search methods are used together.
   *
   * @example
   * // Valid:
   * playerIttfId({ playerFullName: 'FAN Zhendong' });
   * // output: 121404
   * playerIttfId({ playerFamilyName: 'Lebrun'});
   * // output: [{IttfId:"132992", PlayerGivenName:"Alexis",...},{IttfId:, PlayerGivenName:"Felix",...} ,...]
   * 
   *
   * // Invalid:
   * playerIttfId({ fullName: 'FAN Zhendong', givenName: 'Zhendong' }); 
   * Input the full name with the family name in all caps first, then the given name with the first letter capitalized. (e.g. "FAN Zhendong", "LEBRUN Alexis")
   * If playerFullName is inputted and found, returns ittfId as a string; the same applies for GivenName and FamilyNambe, but if multiple players share the GivenName or FamilyName searched for, an array is returned instead.
   */
    async playerIttfId( searchName : FullName | GivenName | FamilyName  ) : Promise<number | object[]> {
        try{
        const hasFullName = !!searchName.playerFullName;
        const hasGivenName = !!searchName.playerGivenName;
        const hasFamilyName = !!searchName.playerFamilyName;

        const count = [hasFullName, hasGivenName, hasFamilyName].filter(Boolean).length;

        //Ensures that only a single search parameter is used at a time
        if (count > 1) {
        throw new Error("Only one of playerFullName, playerGivenName, or playerFamilyName should be provided");
        }
        
        //Ensures that only Latin alphabet characters and spaces are input for name searches
        if (!this.isAlphabetic(Object.values(searchName) as any)) {
            throw new Error("Input cannot contain any numbers or special characters, only roman alphabet characters A-Z/a-z.")
        }

        let response : Response = await fetch(this.allPlayersUrl);
        let output : any = await response.json();
        
        //No players will have the exact same Full Name (Double check this is not allowed e.g. John Smith?)
        if (hasFullName) {
            try{
                let searchResult = output.Result.filter((entries : any) => entries.PlayerFamilyNameFirst === searchName.playerFullName)[0]
            
                return Number(searchResult.IttfId)
            } catch (err : any){
                console.log(err.message);
                throw new Error(`Cannot find player's full name in the database. Ensure that family name comes first, followed by given name (e.g. "ARUNA Quadri", and not "QUADRI Aruna")`)
              }
        }
        else if (hasGivenName){
            try {
                let searchResult = output.Result.filter((entries : any) => entries.PlayerGivenName === searchName.playerGivenName?.charAt(0).toUpperCase()+searchName.playerGivenName.slice(1).toLowerCase())
                
                if (searchResult.length==1){
                    return Number(searchResult[0].IttfId)
                }
                else{
                    return searchResult
                }
            } catch(err : any){
                console.log(err.message);
                throw new Error(`Cannot find given name in the database. Ensure that the spelling is correct and that there is a ranked ITTF player with this given name (e.g. "Hugo", for Hugo Calderano, Hugo Hanashiro, etc.)`)
            }
        }
        else {
            try {
                let searchResult = output.Result.filter((entries : any) => entries.PlayerFamilyName === searchName.playerFamilyName?.toUpperCase())
                
                if (searchResult.length==1){
                    return Number(searchResult[0].IttfId)
                }
                else{
                    return searchResult
                }
            } catch(err : any) {
                console.log(err.message);
                throw new Error(`Cannot find family name in the database. Ensure that the spelling is correct and that there is a ranked ITTF player with this family name (e.g. "Lebrun", for Alexis Lebrun, Félix Lebrun, etc.)`)
            }
            
        }
        
    }
        catch (err) {
            throw err;
        }

    }


    /**
   * Fetch the player's yearly match totals.
   * @param playerFullName - Player's family name and given name. Ensure that the family name is capitalized and placed before the given name. (e.g. "FAN Zhendong", "CALDERANO Hugo")
   * @param playerIttfId - 0-6 digit integer. (e.g. 121404 - FAN Zhendong)
   * 
   * @throws {Error} When multiple search methods are used together. Only input the playerFullName or the playerIttfId - not both.
   * 
   * @example
   * // Valid:
   * playerProfile({ playerFullName: 'FAN Zhendong' });
   * // output: {player: {IttfId:"121404", Org:"CHN", Gender:"M",...}, ranking: {LastPos:[{...}], BestPos:[{...},{...},...]}, stats: {total:{[...]}, indiv:{[...]}, doubles:{[...]}}}
   * playerProfile({ playerIttfId: 121404});
   * // output: {player: {IttfId:"121404", Org:"CHN", Gender:"M",...}, ranking: {LastPos:[{...}], BestPos:[{...},{...},...]}, stats: {total:{[...]}, indiv:{[...]}, doubles:{[...]}}}
   * 
   */
    async playerProfile(searchMethod : PlayerFullName | IttfId ) : Promise<Stats> {
        try{

        const hasFullName = !!searchMethod.playerFullName;
        const hasIttfId = !!searchMethod.playerIttfId;

        const count = [hasFullName, hasIttfId].filter(Boolean).length;

        let profileUrl : string = this.playerProfileUrl
        
        //Ensures that only a single search parameter is used at a time
        if (count > 1) {
            throw new Error("Only one of playerFullName or IttfId should be provided");
          }
        //Ensures that only Latin alphabet characters and spaces are input for name searches
        if (hasFullName){
            if (!this.isAlphabetic(searchMethod.playerFullName)) {
                throw new Error("Name cannot contain any numbers or special characters, only roman alphabet characters A-Z/a-z.")
            }

            const playerId = await this.playerIttfId({playerFullName:searchMethod.playerFullName})

            profileUrl += playerId
        }
        //Ensures that only positive integers are input for ID searches
        if (hasIttfId) {
            if (!this.isPositiveInteger(searchMethod.playerIttfId)) {
              throw new Error('Invalid ittfID! Format must be 0-6 digit integer.');
            }

            profileUrl += searchMethod.playerIttfId

        }

        let response : Response = await fetch(profileUrl);
        let output : any = await response.json();
        // console.log(output.Result[0].Age);
        
        // console.log(filteredOutput.length);
        // let player = this.playerProfileUrl +
        console.log(output);
        
        return output 
        
    }
        catch (err) {
            throw err;
        }

    }


};