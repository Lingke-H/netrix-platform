# Survey Analysis Methodology

## Source And Privacy

The analysis uses the locally provided survey workbook. The workbook contains 60 responses and 58 columns. Because the raw file includes names and email addresses, it is not copied into the repository. All repository outputs are aggregate summaries, derived tables, and non-identifying visualisations.

## Cleaning Approach

The analysis standardises selected categorical labels into English, normalises major entries into broad clusters, and splits semicolon-style multi-select answers into separate selected options. Major clustering is interpretive: MAM and Statistics-like responses are treated as a Math / Statistics proxy, CS and CSAI are treated as a CS / AI proxy, and EEE is retained as its own first-wedge cluster.

The analysis does not preserve respondent-level rows. Summary tables are produced only at aggregate level.

## Statistical Position

The survey is treated as exploratory discovery evidence. The sample is heavily concentrated in Year 2 respondents and does not appear to be a random sample of the UNNC population. For that reason, the analysis focuses on descriptive statistics rather than formal population inference.

The `key_signals.csv` table includes Wilson-style 95 percent intervals only as illustrative uncertainty ranges under a hypothetical random-sampling assumption. These intervals should not be used to claim population representativeness, because sampling bias may be larger than random sampling error.

## Visualisation Approach

The figures are designed as a compact exploratory data analysis set. They use different chart forms according to the structure of the underlying variable: lollipop charts for high-level indicators, stacked distributions for ordered attitude responses, dot plots for multi-select preferences, a funnel for participation-role imbalance, a flow-style figure for study-buddy discovery routes, and a radar chart for AI-tool evaluation dimensions. The visualisations are descriptive and should be interpreted together with the methodology caveats.

## Recommended Follow-Up

The next evidence layer should be 8 to 12 targeted interviews with Math, Computer Science, and EEE students, followed by MVP behavioural metrics. The strongest validation will come from observing whether students create posts, complete academic profiles, click recommended profiles, send connection requests, accept requests, and continue academic conversations after connection.
