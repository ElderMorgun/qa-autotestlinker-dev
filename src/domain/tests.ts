export interface DetectedTest {
  filePath: string;        // file path
  line: number;            // 1-based line number of it()/test()
  rawTitle: string;        // full title as in the source
  title: string;           // title without " - TAGS-xxxxx"
  hasCaseId: boolean;      // already linked to Tricentis?
  caseId?: string;         // for example "TAGS-8708"
  describePath: string[];  // all describe blocks from outermost to innermost
}
