export {};
declare global {

//// currentRankings
    interface RankEntry {
        name : string,
        rank : string,
        assoc : string,
        points : string
    };

    interface Player {
        player : object
    }

    type Rankings = RankEntry[];
    type Stats = Player;

//// playerIttfId
    type FullName = {
        playerFullName: string;
        playerGivenName?: never;
        playerFamilyName?: never;
        playerIttfId?: never;
    };

    type GivenName = {
        playerFullName?: never;
        playerGivenName: string;
        playerFamilyName?: never;
        playerIttfId?: never;
    };

    type FamilyName = {
    playerFullName?: never;
    playerGivenName?: never;
    playerFamilyName: string;
    playerIttfId?: never;
    };
    
//// playerProfile
    type PlayerFullName = {
        playerFullName: string;
        playerIttfId?: never;
    };

    type IttfId = {
    playerIttfId: number;
    playerFullName?: never;
    };

}

