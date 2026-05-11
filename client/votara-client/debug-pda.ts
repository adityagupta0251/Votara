import { pdaTreasury } from "./src/pda";

console.log("TREASURY PDA:", pdaTreasury()[0].toBase58());