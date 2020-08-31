// Just a stub test
import {getTopology} from "./toplogy-parser";

const input: string = "Topologies:\n" +
  "   Sub-topology: 0\n" +
  "    Source: KSTREAM-SOURCE-0000000000 (topics: [a])\n" +
  "      --> lenght-filter\n" +
  "    Processor: lenght-filter (stores: [])\n" +
  "      <-- KSTREAM-SOURCE-0000000000\n"


  describe('topolgy-parser test', () => {
  it('should return true', () => {
    let topology = getTopology(input);
    expect(JSON.stringify(topology)).toEqual(
      "[{\"id\":\"KSTREAM-SOURCE-0000000000\",\"data\":{\"label\":\"KSTREAM-SOURCE-0000000000\"},\"position\":{\"x\":0,\"y\":0}},{\"id\":\"edge:KSTREAM-SOURCE-0000000000-->lenght-filter\",\"source\":\"KSTREAM-SOURCE-0000000000\",\"target\":\"lenght-filter\",\"animated\":true,\"arrowHeadType\":\"arrow\"},{\"id\":\"lenght-filter\",\"data\":{\"label\":\"lenght-filter\"},\"position\":{\"x\":0,\"y\":100}}]"
    )
  })
});


it("testNoneNodeInput", ()=>{
  let topology = getTopology(  "" +
    "Sub-topology: 2 for global store (will not generate tasks)\n" +
    "    Processor: KTABLE-SOURCE-0000000018 (stores: [c])\n" +
    "      --> none\n")

  expect(JSON.stringify(topology)).toEqual(
    "[{\"id\":\"KTABLE-SOURCE-0000000018\",\"data\":{\"label\":\"KTABLE-SOURCE-0000000018\"},\"position\":{\"x\":0,\"y\":0}}]"
  )
});
