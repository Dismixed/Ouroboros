export default interface TransactionType {
    date: Date;
    type: String;
    desc: String;
    amount: Number;
    oldBalance: Number;
    newBalance: Number;
}
