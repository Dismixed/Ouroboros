export default interface InvestmentType {
    symbol: String;
    initialPrice: number;
    type: String;
    currentPrice?: number;
    amount: number;
}