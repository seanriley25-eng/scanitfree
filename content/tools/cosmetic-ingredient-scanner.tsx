import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "Is the Cosmetic Ingredient Scanner medical advice?",
    a: "No. It explains what is in a formula and points out ingredients that are worth knowing about, but it cannot assess your skin, your health history, or your pregnancy. If you have eczema, rosacea, a known allergy, or a pregnancy question, check the product with a dermatologist or your prenatal provider.",
  },
  {
    q: "Where do I find the ingredient list on a product?",
    a: "Look on the back of the bottle, the outer box, or the tube crimp. In the United States the list is usually headed \"Ingredients\" and runs from the most concentrated ingredient to the least. If the list is tiny or curved around a bottle, a photo is easier than retyping it.",
  },
  {
    q: "What can I upload, and how long can the list be?",
    a: "You can upload a PNG, JPG, WEBP, PDF, or DOCX file up to 10 MB, or paste text up to 24,000 characters. A clear, in-focus photo of the label works best. If you upload a file you can also type the product name in the text box for extra context.",
  },
  {
    q: "What do the EWG numbers next to ingredients mean?",
    a: "They follow the style of the Environmental Working Group's Skin Deep database, where 1 to 2 is low concern and 7 to 10 is high concern. The tool shows a number only when it is confident of the figure and leaves it off otherwise, so a missing number does not mean an ingredient is safe or unsafe.",
  },
  {
    q: "Is the product I scanned stored anywhere?",
    a: "No. Your pasted text or photo is sent to the analysis model, the result is returned to your browser, and nothing is saved to a database. Close the tab and the result is gone.",
  },
  {
    q: "How many scans can I run?",
    a: "Fifteen per day from one network address across all ScanItFree tools. The limit keeps the service free, and it resets after 24 hours.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        A cosmetic label lists dozens of chemical names in small print, and most of us
        have no way to tell which ones matter. The Cosmetic Ingredient Scanner reads an
        ingredient list for a skincare, makeup, hair, or body product and turns it into
        a plain-English review: what each ingredient does, which ones are worth knowing
        about, and whether the claims on the front of the package match what is actually
        in the bottle.
      </p>
      <p>
        It is made for people who read labels before buying: someone with sensitive or
        reactive skin, someone who is pregnant or trying to be, a parent choosing
        products for a child, and anyone who wants to know whether &ldquo;clean&rdquo; or
        &ldquo;fragrance-free&rdquo; on a package means what it seems to mean. It works
        on face washes, moisturizers, serums, sunscreens, makeup, shampoos, conditioners,
        and body lotions.
      </p>

      <h2>How it works</h2>
      <p>
        You either paste the ingredient list or upload a photo or PDF of the label. The
        tool reads the ingredients by their INCI names, the standard international
        naming system for cosmetics, and it does not matter whether the list is in
        capitals, lowercase, or split across lines. The text is sent to Anthropic&apos;s
        Claude model together with a written rubric that a person maintains. The model
        follows that rubric rather than improvising its own criteria. It works out the
        product type from the ingredients, so you do not need to say whether it is a
        mascara or a body wash.
      </p>
      <p>
        Where it is confident, it adds an EWG Skin Deep style concern score from 1 to 10
        for an ingredient. If it is unsure of the number, the rubric tells it to leave
        the score off. The rubric also tells it to cite a source, such as EWG Skin Deep,
        published research, or a cosmetic regulation, only when a real one applies.
      </p>
      <p>The rubric asks for specific checks in four areas.</p>
      <ul>
        <li>
          <strong>Pregnancy flags:</strong> retinol, retinyl palmitate, adapalene,
          tretinoin, salicylic acid above 2%, hydroquinone, formaldehyde releasers such
          as DMDM hydantoin, imidazolidinyl urea, and quaternium-15, and high-dose
          essential oils.
        </li>
        <li>
          <strong>Contact allergens:</strong> methylisothiazolinone,
          methylchloroisothiazolinone, formaldehyde, fragrance or parfum, lanolin,
          balsam of Peru, and paraphenylenediamine (PPD).
        </li>
        <li>
          <strong>Endocrine-disruptor candidates:</strong> parabens (especially
          butylparaben and propylparaben), phthalates such as DBP and DEHP, oxybenzone,
          octinoxate, and triclosan.
        </li>
        <li>
          <strong>Marketing claims:</strong> &ldquo;natural&rdquo; has no legal
          definition for cosmetics under 21 CFR Part 700, and &ldquo;clean&rdquo; is an
          unregulated term. A &ldquo;fragrance-free&rdquo; product can still contain
          masking components such as linalool, limonene, citronellol, and geraniol. A
          &ldquo;paraben-free&rdquo; product may use a different preservative, such as
          phenoxyethanol, instead.
        </li>
      </ul>
      <p>
        The rubric also sets the tone: findings are written with phrases like
        &ldquo;worth knowing&rdquo; and &ldquo;consider,&rdquo; and the word
        &ldquo;dangerous&rdquo; is kept for ingredients that genuinely warrant it.
      </p>

      <h2>How to read your results</h2>
      <p>
        The <strong>score</strong> runs from 0 to 100, where a higher number means a
        cleaner formulation. It maps to a letter grade: A (90 to 100) is a clean
        formulation with low concern; B (70 to 89) has minor concerns; C (50 to 69)
        has moderate concerns worth knowing; D (30 to 49) has significant concerns; and
        F (0 to 29) has multiple high-concern ingredients. A grade is a summary of the
        list as a whole, so look at what pulled the score down before deciding anything.
      </p>
      <p>
        <strong>Ingredient flags</strong> are the individual findings. Each carries a
        severity: danger, warning, info, or safe. It also shows the ingredient&apos;s
        purpose in the formula (for example, preservative or emollient), any specific
        concerns such as irritation or allergen potential, and a short plain-English
        explanation. Danger and warning items appear first, and ingredients with no
        concerns are hidden behind a toggle so the list stays readable.
      </p>
      <p>
        The <strong>special considerations</strong> block answers the questions people
        most often have. It shows whether the product looks pregnancy safe (yes, no,
        caution, or unknown), whether it suits sensitive skin, whether it is truly
        fragrance-free, the comedogenic risk (low, moderate, or high, meaning how likely
        it is to clog pores), and a list of contact allergens present. If the pregnancy
        answer is &ldquo;no&rdquo; or &ldquo;caution,&rdquo; a note names the ingredients
        and the reason.
      </p>
      <p>
        The <strong>claims check</strong> takes each marketing claim it can find and
        marks it as verified, partial, or misleading, with a reason. The{" "}
        <strong>top concerns</strong> chips list the three to five ingredients you most
        need to know about.
      </p>

      <h2>A sample result</h2>
      <p>
        Someone scans a face moisturizer that is labelled &ldquo;fragrance-free.&rdquo;
        The tool returns a score of 78, grade B, with these findings:
      </p>
      <ul>
        <li>
          <strong>Warning:</strong> Fragrance/parfum appears in the list. It is a common
          contact allergen, and the single word can stand for many undisclosed
          components. Worth knowing if you react easily to scented products.
        </li>
        <li>
          <strong>Info:</strong> Phenoxyethanol, a preservative. It is widely used and
          generally well tolerated at the low levels allowed in cosmetics, but some
          people with very reactive skin find it irritating.
        </li>
        <li>
          <strong>Claims check:</strong> &ldquo;Fragrance-free&rdquo; is marked
          misleading. Limonene and linalool are listed, and both are fragrance
          components that can act as allergens even when no perfume is named.
        </li>
        <li>
          <strong>Pregnancy:</strong> Caution. The formula contains retinyl palmitate, a
          retinoid ester. At a low dose in a moisturizer the concern is modest, but
          consider asking your prenatal provider before using it daily.
        </li>
      </ul>
      <p>
        Fragrance-free status: claims but contains masking fragrance. Summary: a
        generally well-made moisturizer whose main drawback is that its fragrance-free
        claim does not hold up.
      </p>

      <h2>Limitations</h2>
      <p>
        An ingredient list shows what is in a product, not how much. Labels do not
        disclose concentrations, so the tool cannot tell whether a flagged ingredient is
        present at a trace amount or a meaningful one, and dose usually decides whether
        an ingredient matters. Ingredients are listed in descending order down to about
        1%, which helps, but below that line the order carries no information.
      </p>
      <p>
        EWG Skin Deep scores are hazard-based, meaning they rate what an ingredient could
        do in some circumstances, rather than risk-based, which would account for how
        much you are exposed to. They are also contested: toxicologists and some industry
        groups argue they overstate concern for ingredients used at low levels. Treat a
        score as one input, not a verdict.
      </p>
      <p>
        The tool cannot predict how your own skin will react. Patch test a new product on
        a small area for a few days, and see a dermatologist for conditions such as
        eczema, rosacea, or contact dermatitis, or when a reaction is severe. It does not
        cover medical devices or prescription products, and photos must be sharp and
        legible, because a blurry or cropped label can lead to misread or missing
        ingredients. If the result looks incomplete, retype the list.
      </p>
    </>
  );
}
