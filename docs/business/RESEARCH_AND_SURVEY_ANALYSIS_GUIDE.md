# Research And Survey Analysis Guide

This guide explains how the Biz team should use the existing approximately 60 survey responses in the NeTrix business plan. The main principle is simple: the survey is valuable as early discovery evidence, but it should not be presented as definitive proof of whole-population demand unless the sampling method supports that claim.

For the current aggregate findings from the received workbook, see `SURVEY_ANALYSIS_BRIEF.md`. The raw Excel file contains respondent names and email addresses and should not be committed to the repository unless an anonymised copy is created.

## 1. Recommended Evidence Position

The existing survey should be treated as an exploratory sample. It can help identify early problem patterns, user language, segment differences, and potential demand signals. It should not be used to claim that the entire UNNC population has the same preferences unless the sample was collected through a sufficiently representative method.

The business plan should use careful language. It may say that early survey responses suggest a problem, indicate interest, or reveal recurring pain points. It should avoid claiming that the survey proves market demand or statistically represents all UNNC students.

## 2. When Statistical Inference Is Appropriate

Statistical inference is appropriate only when the team can reasonably define the target population and explain how the sample relates to that population. For NeTrix, possible target populations include all UNNC students, all UNNC FoSE students, or specifically Math, Computer Science, and EEE students.

If the survey was distributed through convenience channels such as friend groups, class chats, or team networks, it is not a random sample. In that case, the team may still calculate proportions and visualise patterns, but those results should be framed as exploratory rather than population-level estimates.

If the team wants to use inferential language, it must first answer four questions:

| Question | Required Answer |
| --- | --- |
| What is the target population? | For the first MVP, Math, Computer Science, and EEE students are the most defensible population. |
| How was the sample recruited? | The method must be described honestly, including convenience sampling if applicable. |
| Does the sample composition resemble the population? | Compare major, year, and user-type distribution if population benchmarks are available. |
| What level of uncertainty remains? | Report uncertainty and avoid overclaiming, especially with small subgroup sizes. |

## 3. Practical Interpretation Of A 60-Response Sample

A sample of 60 can be useful for early discovery. It is large enough to identify recurring themes and approximate proportions in the sample. It is not large enough to support highly precise estimates for multiple subgroups.

If the sample were random, the maximum approximate 95 percent margin of error for a proportion near 50 percent would be about plus or minus 13 percentage points. Because the actual sample is likely not random, sampling bias may be more important than mathematical margin of error.

This means the Biz team can use the survey to say:

> In our early survey sample, a meaningful share of respondents reported difficulty finding academic information, resources, or study partners.

The team should not say:

> UNNC students as a whole experience this problem at the same rate as our survey sample.

## 4. Recommended Analysis Plan

The survey analysis should begin with data cleaning. Remove duplicate responses if identifiable, check missing values, standardise major and year labels, and separate closed-ended questions from open-ended responses. If personal data exists, remove names, student IDs, email addresses, or contact information before analysis files are shared.

The first quantitative layer should be descriptive. Report counts and percentages for the most important questions, such as frequency of information-search difficulty, channels currently used, pain intensity, willingness to use an academic platform, interest in Q&A posts, interest in resource posts, interest in experience sharing, and interest in finding study partners or academic connections.

The second layer should be segmentation. Compare responses by major, year, and user behaviour if the subgroup sizes are large enough to be meaningful. For example, the team may compare whether CS students express stronger interest in technical Q&A, whether Math students care more about study resources, or whether senior students provide more experience-sharing value. Small subgroup results should be presented as directional rather than conclusive.

The third layer should be qualitative coding. Open-ended answers should be coded into recurring themes, such as fragmented information, missed opportunities, difficulty finding reliable resources, lack of study partners, reliance on private chats, and interest in AI-assisted organisation or recommendation. The business plan should use short paraphrased examples rather than exposing personal text that could identify respondents.

## 5. Suggested Metrics To Extract

The following metrics are especially relevant to the NeTrix thesis:

| Metric | Why It Matters |
| --- | --- |
| Frequency of academic information difficulty | Measures the existence and regularity of the problem. |
| Current channels used | Shows fragmentation across official sites, WeChat, peers, AI tools, and resource folders. |
| Pain intensity | Helps judge whether the problem is strong enough to motivate behaviour change. |
| Interest in Q&A posts | Tests one part of the Post Layer. |
| Interest in Resource posts | Tests the Library and Resource Centre logic. |
| Interest in Experience Sharing posts | Tests whether peer experience can become platform content. |
| Interest in finding study partners or academic peers | Tests the Connection Layer. |
| Comfort with academic profiles | Tests whether users will provide the data needed for recommendations. |
| Trust requirements | Helps decide whether campus email verification and moderation are necessary. |
| Willingness to use AI recommendations | Tests acceptance of AI-assisted profile and buddy recommendation. |

## 6. Recommended Statistical Techniques

For the current stage, descriptive statistics are more appropriate than complex inference. Use frequency tables, percentages, bar charts, stacked bars, and simple cross-tabulations. If the survey contains Likert-scale questions, report distributions rather than only averages. In the current workbook, multi-select fields should be split by semicolon-style delimiters and counted as multiple selected options rather than as single text strings.

If the team wants to include confidence intervals, use them sparingly and only for the most important overall proportions. A Wilson confidence interval is preferable for proportions in small samples. The business plan should state that intervals reflect sampling uncertainty under an approximate random-sampling assumption and do not remove potential recruitment bias.

Hypothesis tests are generally not recommended for the first business-plan draft unless the question is very specific and subgroup sizes are adequate. With 60 responses, many subgroup comparisons will be underpowered and unstable.

## 7. Recommended Survey Evidence Language

The following language is appropriate:

> The existing 60-response exploratory survey provides early evidence that students perceive academic information and peer support as fragmented. The survey should be interpreted as a discovery signal rather than conclusive proof of population-level demand.

The following language is stronger but still responsible if supported by the actual results:

> Within the exploratory sample, respondents repeatedly reported reliance on multiple fragmented channels, including peer chats, official pages, shared files, and AI tools. This pattern supports the need for further validation of NeTrix's post-to-profile-to-connection loop.

The business plan should avoid population-level claims unless the team can justify representativeness.

## 8. Next Research Steps

The Biz team should follow the survey analysis with 8 to 12 targeted interviews across Math, Computer Science, and EEE. These interviews should test why students would post, what makes a profile trustworthy, what kind of recommendation feels useful, and what would make them send or accept a connection request.

After the MVP is available, the most important evidence will be behavioural. The team should measure whether students create posts, complete profiles, accept AI-assisted profile suggestions, click recommended profiles, send connection requests, accept requests, and continue conversations after connection.
