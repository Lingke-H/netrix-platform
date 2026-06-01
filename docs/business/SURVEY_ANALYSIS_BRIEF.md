# Initial Survey Analysis Brief

This brief summarises the current 60-response academic communication survey at an aggregate level. It is intended to help the Biz team use the dataset responsibly in the business plan. It should not be treated as a final research report, and it should not include respondent names, emails, or other personally identifiable information.

## 1. Dataset Status

The workbook contains 60 responses and 58 columns. The raw file includes personal identifiers such as email and name fields, so it should remain outside the repository unless an anonymised version is prepared. Business-plan materials should use only aggregate statistics, anonymised paraphrases, and non-identifying examples.

The survey appears to be an exploratory discovery dataset rather than a representative sample of the full UNNC population. It is useful for identifying early demand signals and recurring pain points, but it should not be used to make definitive population-level claims without additional sampling justification.

## 2. Sample Composition

The sample is heavily concentrated in undergraduate respondents, especially Year 2 students. It is also mostly non-international.

| Attribute | Aggregate Result |
| --- | --- |
| Total responses | 60 |
| International students | 4 respondents |
| Non-international students | 56 respondents |
| Year 2 respondents | 47 respondents |
| Year 1 respondents | 8 respondents |
| Year 3, Year 4, and postgraduate respondents | 5 respondents combined |

The major distribution is mixed. The dataset includes relevant first-wedge respondents from CS, CSAI, EEE, MAM, and Statistics-related entries, but it also includes a meaningful number of FAM, IBE, IB, Architecture, Engineering, and other majors. If MAM and Statistics-related responses are treated as part of the Math-side wedge, the first-wedge-relevant subset is approximately 27 out of 60 responses. This is useful but not sufficient for strong first-wedge validation.

The business plan should therefore describe the survey as broad exploratory evidence and should use targeted Math, Computer Science, and EEE interviews to strengthen the first-wedge claim.

## 3. Key Aggregate Signals

The strongest signals in the current dataset support the existence of fragmented academic information behaviour and high reliance on AI tools.

| Finding | Aggregate Signal | Business Interpretation |
| --- | --- | --- |
| Frequent help-seeking exists | 55 out of 60 respondents seek help at least occasionally when facing learning difficulties. | Academic support is a recurring behaviour, not a rare exception. |
| AI is the dominant current method | 55 out of 60 respondents selected AI tools as their most common method for solving unclear knowledge points. | The "AI-assisted learning era" framing is strongly supported by the sample. |
| Information scarcity is common | 57 out of 60 respondents report being in an information-scarce state at least sometimes. | The information-gap narrative has early evidence. |
| Centralised academic information is valued | 55 out of 60 respondents consider a centralised school-related information website or app meaningful. | The Resource Centre and campus information layer have clear early support. |
| Study-buddy interest exists | 49 out of 60 respondents have either considered or tried finding a study buddy. | The academic connection thesis has a real user-behaviour basis, but requires deeper validation. |
| Passive participation may be common | 40 respondents selected browsing as a preferred participation mode. | The platform must solve the cold-start and content-density problem; it cannot rely only on active posting. |

## 4. Feature Preference Signals

The most requested platform functions are not limited to question answering. Several high-ranking preferences relate to broader academic opportunities, experience, and planning.

| Desired Function | Responses |
| --- | ---: |
| Research or internship opportunity sharing | 47 |
| Research experience and application writing exchange | 38 |
| Course reviews and module-selection advice | 37 |
| Subject Q&A and academic discussion | 31 |
| Study materials and note sharing | 30 |
| Academic lecture and event aggregation | 21 |

This pattern suggests that NeTrix should not be written as a narrow Q&A product. The business plan should frame Q&A, Resource, and Experience Sharing posts as different forms of academic signals. The high interest in opportunity sharing, research experience, course selection, and study materials supports the broader "academic knowledge and experience circulation" narrative.

## 5. Participation And Motivation Signals

Respondents show stronger willingness to browse or ask than to answer. This matters for go-to-market and content strategy.

| Participation Mode | Responses |
| --- | ---: |
| Browse content with limited active posting | 40 |
| Ask questions | 35 |
| Comment, discuss, or supplement viewpoints | 15 |
| Answer others' questions | 8 |

The most common motivations are solving immediate learning problems, deepening understanding, and accessing course-related internal information.

| Motivation | Responses |
| --- | ---: |
| Solve urgent learning problems | 34 |
| Strengthen understanding through explanation | 27 |
| Access course-related internal information or experience | 27 |
| Build academic social relationships or find study partners | 17 |

This suggests that the first business-plan narrative should lead with practical academic utility and then connect that utility to academic connection. If the plan leads only with social networking, it may understate the immediate academic reasons students would enter the platform.

## 6. Study-Buddy And Connection Signals

The study-buddy data supports the connection layer, but it also shows why NeTrix should not rely only on manual social posting.

| Study-Buddy Status | Responses |
| --- | ---: |
| Has considered finding a study buddy but has not acted | 32 |
| Has tried finding a study buddy | 17 |
| Has never considered it | 11 |

Among respondents who tried finding a study buddy, the main method was contacting existing friends. Only a small number reported using broader public channels. This supports the idea that current discovery mechanisms are socially limited and dependent on existing networks.

The business plan should use this as an argument for AI-assisted academic recommendation. The value is not simply that students can message each other; the value is that NeTrix can help students discover academically relevant peers outside their immediate friend group, while still preserving request-based consent.

## 7. Trust, Privacy, And Interaction Signals

A majority of respondents prefer anonymous questioning over real-name questioning, while many others are neutral. This supports a softer identity model rather than a fully professional real-name platform.

| Question | Aggregate Result |
| --- | --- |
| Prefer anonymous questioning | 37 respondents selected yes, 21 were neutral, and 2 selected no. |
| Habit of casual commenting | 5 respondents selected yes, 30 selected sometimes or depends, and 25 selected no. |

These results support the current identity model: campus verification for trust, academic nicknames for lower social pressure, and request-based messaging for controlled connection. They also imply that the platform should not assume users will naturally comment or answer frequently without prompts, incentives, or highly relevant content.

## 8. Implications For The Business Plan

The survey can support four business-plan arguments.

First, the problem is real enough to investigate further. Many respondents experience information scarcity and rely on multiple channels for academic support. Second, the "AI-assisted learning era" narrative is credible because AI tools dominate current self-help behaviour in the sample. Third, the product should not be reduced to Q&A; the data suggests interest in opportunities, experience, course advice, and resource sharing. Fourth, academic connection has evidence, but it should be framed as a recommendation-supported extension of academic utility rather than as a purely social-networking proposition.

The business plan should not claim that the survey proves population-level demand. It should state that the survey provides early discovery evidence and motivates the next validation stage.

## 9. Dedicated Analysis Outputs

A dedicated analysis folder now records the current descriptive analysis outputs: `docs/business/survey_analysis/`. It contains an EDA report, methodology note, SVG visualisations, and aggregate CSV tables. These outputs provide survey evidence that the Biz team can interpret and integrate into the business plan.

If the team later needs a respondent-level analysis workbook, it should be created from an anonymised version of the dataset. That workbook should include cleaned major categories, first-wedge tagging, count and percentage tables, multi-select response coding, and charts for the most important business-plan findings, without preserving names, emails, or other personally identifiable information.

The next research step should be 8 to 12 targeted interviews with Math, Computer Science, and EEE students. Those interviews should test whether the specific first-wedge users understand the post-profile-recommendation-connection loop and whether they would take real actions inside it.

## 10. Recommended Business-Plan Wording

The following wording is appropriate:

> An initial 60-response exploratory survey suggests that students frequently rely on AI tools, experience recurring academic information scarcity, and see value in centralised academic information. The data also indicates interest in academic opportunities, course advice, resource sharing, and study-buddy discovery. Because the sample is exploratory and not fully representative of the first MVP wedge, these findings should be treated as early discovery evidence and followed by targeted interviews and MVP behavioural testing.

The following wording should be avoided:

> The survey proves that UNNC students will use NeTrix.

The evidence is promising, but the next stage must validate behaviour, not only stated interest.
