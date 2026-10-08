import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "Does the Food Safety Scanner look up my product by barcode?",
    a: "Not in a barcode database. A UPC you type is passed to the analysis model as text, and the model can only work from what it recognizes. The live FDA recall search also ignores digits, so a bare UPC skips it. For the most reliable result, type the product name with the brand, or upload a clear photo of the ingredient panel.",
  },
  {
    q: "How current is the recall check?",
    a: "Each scan asks the openFDA enforcement database for food recalls started in the past 365 days that match the first few words of your product name. Results are cached for up to five minutes. openFDA can lag the public announcement by days, so check fda.gov directly if you are worried about a specific product.",
  },
  {
    q: "Can I rely on it to tell me whether a food is safe for my allergy?",
    a: "No. It flags the common allergens it can see on a label, but it does not know your allergy, your threshold, or whether a facility has cross-contact. If you have a serious allergy, read the full label yourself and ask your allergist or doctor.",
  },
  {
    q: "What can I upload, and how many scans can I run?",
    a: "You can paste up to 24,000 characters of text, or upload a PDF, DOCX, PNG, JPG, or WebP file up to 10 MB. Each network address gets 15 free scans per day across all ScanItFree tools, and the limit resets every 24 hours.",
  },
  {
    q: "Is my label photo or ingredient list stored?",
    a: "No. The text or file is sent to Anthropic's Claude model, the result comes back to your browser, and the tool does not save it. The only thing sent to openFDA is a short search phrase made from the first few words of your text.",
  },
  {
    q: "Why did a product I eat all the time get a B or a C?",
    a: "The grade reflects documented concerns about ingredients and recalls, not whether the food will make you sick. Common additives such as artificial dyes and preservatives lower the score even though they are legal. Read the flags to see which ones drove the number, then decide whether they matter to you.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        Food labels are long, small, and written in ingredient names most shoppers have
        never had explained. Recalls are announced in places most shoppers never look.
        The Food Safety Scanner puts the two together: you give it a product, and it
        looks for recalls that match it, reads the ingredients, and returns a score,
        a letter grade, and a short list of specific concerns in plain English.
      </p>
      <p>
        It is meant for shoppers who want a second look before buying something
        unfamiliar, parents checking a snack, people trying to avoid certain additives,
        and anyone who heard about a recall and wants to know whether their product might
        be involved. It is a screening aid. It does not replace reading the label or
        talking to a doctor.
      </p>

      <h2>How it works</h2>
      <p>
        You can type a product name, enter a UPC, paste an ingredient list, or upload a
        photo or PDF of the label. Text and file uploads can be combined, so you can
        upload a photo and add the product name for context.
      </p>
      <p>
        Every scan starts with a live lookup. The tool takes the first few words of what
        you entered and searches the openFDA food enforcement database for recalls
        started in the past year. Any recall it finds is handed to the model as
        verified data. If your product matches, the result shows a red flag with the FDA
        recall number so you can look it up yourself. If openFDA does not answer in time,
        the scan still finishes, but without the recall cross-check badge.
      </p>
      <p>
        The reading itself is done by Anthropic&apos;s Claude model, following a written
        rubric that a person maintains. The rubric tells it to look at known allergens
        and labeling requirements, controversial additives such as artificial colors and
        preservatives, and nutritional red flags such as very high sodium, sugar, or trans
        fat. In practice that means the nine major US allergens: milk, eggs, fish,
        shellfish, tree nuts, peanuts, wheat, soy, and sesame. It also means additives
        that commonly draw a warning: BHA and BHT preservatives, artificial dyes such as
        Red 40, Yellow 5, and Blue 1, sodium nitrite, and partially hydrogenated oils,
        which are the source of artificial trans fat.
      </p>
      <p>
        Citations are optional by design. The rubric allows a source on a flag only when
        a real one applies, either an actual FDA recall number or a section of the Code of
        Federal Regulations such as 21 CFR 101.22, and tells the model to leave the
        citation off rather than guess. If a flag has no citation, that is intentional.
      </p>

      <h2>How to read your results</h2>
      <p>
        The <strong>score</strong> runs from 0 to 100 and maps to a letter grade. 90 to
        100 is an A, very safe. 70 to 89 is a B, with minor concerns. 50 to 69 is a C,
        moderate concerns. 30 to 49 is a D, significant concerns. 0 to 29 is an F,
        serious safety issues.
      </p>
      <p>
        <strong>Flags</strong> are the individual findings, each with one of three
        severities. A <strong>danger</strong> flag is the most serious: a verified recall
        that matches your product, or an ingredient problem the model considers a real
        safety hazard. A <strong>warning</strong> flag is a documented concern that is
        not an emergency, such as a controversial additive or high sodium. An{" "}
        <strong>info</strong> flag is context worth knowing, such as a declared allergen,
        or a recall of a similar product that does not match yours.
      </p>
      <p>
        Below the flags, the <strong>summary</strong> gives the overall picture in two or
        three sentences. When the recall check completed, a badge reads
        &ldquo;Cross-referenced openFDA enforcement database.&rdquo; If that badge is
        missing, treat the recall portion of the result as unchecked.
      </p>

      <h2>A sample result</h2>
      <p>
        Here is what a scan of a boxed cheese cracker snack might return. This is an
        illustration of the format, not a real product. Score 78, grade B:
      </p>
      <ul>
        <li>
          <strong>Info:</strong> Contains milk and wheat, both declared on the label. This
          matters only if you avoid either one.
        </li>
        <li>
          <strong>Warning:</strong> Contains Yellow 5 and BHT. Both are permitted in the
          US and must be declared on the label (21 CFR 101.22), but some shoppers choose to
          avoid artificial dyes and synthetic preservatives.
        </li>
        <li>
          <strong>Info:</strong> The FDA enforcement database shows a recent recall of a
          similar cheese cracker from a different manufacturer. It does not match this
          product, but it is worth knowing if you buy this category often.
        </li>
      </ul>
      <p>
        Summary: a mainstream snack with no active recall, two common allergens, and one
        pair of additives some people prefer to skip. If the first flag had instead been
        a matching recall, it would appear at the top as a danger flag with the FDA
        recall number, and the grade would drop sharply.
      </p>

      <h2>Limitations</h2>
      <p>
        This is not a nutrition tool. It may point out very high sodium, sugar, or trans
        fat, but it does not calculate calories, macros, or serving sizes, and it will not
        tell you whether a food fits your diet. It also is not individual allergy or
        medical advice. It cannot know your allergy, your sensitivity, or how a factory
        handles cross-contact.
      </p>
      <p>
        The recall check has gaps you should know about. The FDA enforcement database
        can lag the public announcement by days, so a brand-new recall may not appear yet.
        Meat, poultry, and processed egg products are regulated by the USDA, and their
        recalls are posted in a separate FSIS database that this tool does not query.
        The search uses only the first few words you enter, so a pasted ingredient list
        or a bare UPC may not trigger it, and a product name works best. When no recall
        data comes back, the model may still mention historical recalls from memory, and
        those are shown as info flags because nothing verified them.
      </p>
      <p>
        Label photos must be legible. A blurry, cropped, or glare-covered photo gives the
        model less to read, and it can miss ingredients. A grade of A means no known
        issue was found, not a guarantee. Always read the label yourself, especially for
        allergies, and check fda.gov or fsis.usda.gov for recalls on a product you are
        worried about.
      </p>
    </>
  );
}
