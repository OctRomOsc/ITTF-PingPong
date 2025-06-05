export {};
declare global {
interface RankEntry {
    name : string,
    rank : string,
    assoc : string,
    points : string
};

type Rankings = RankEntry[];
}