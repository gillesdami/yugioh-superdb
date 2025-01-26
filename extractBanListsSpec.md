# extract ban lists spec

The goal is to scrap banlist information to fill the databases limitation and banlist.

We can find the possible date for each banlist at this url: https://www.db.yugioh-card.com/yugiohdb/forbidden_limited.action?request_locale=LOC where LOC is "ja" or "en"

The values of the following select are the possible date:

<select id="forbiddenLimitedDate" name="forbiddenLimitedDate"><option value="2025-01-01">2025/01/01</option><option value="2024-10-01">2024/10/01</option><option value="2024-07-01">2024/07/01</option><option value="2024-04-01">2024/04/01</option><option value="2024-01-01">2024/01/01</option><option value="2023-10-01">2023/10/01</option><option value="2023-07-01">2023/07/01</option><option value="2023-04-01">2023/04/01</option><option value="2023-01-01">2023/01/01</option><option value="2022-10-01">2022/10/01</option><option value="2022-07-01">2022/07/01</option><option value="2022-04-01">2022/04/01</option><option value="2022-01-01">2022/01/01</option><option value="2021-10-01">2021/10/01</option><option value="2021-07-01">2021/07/01</option></select>

The region.region in the database should be "OCG" if the locale is "ja" else it should be "TCG".
DATE is the date of the banlist, LOC is the location of the banlist ("ja" or "en").

By browsing `https://www.db.yugioh-card.com/yugiohdb/forbidden_limited.action?forbiddenLimitedDate=DATE&request_locale=LOC` we can see the following html tags:

<div id="list_forbidden">
<div id="list_limited">
<div id="list_semi_limited">

inside each we can find inputs such as:

<input type="hidden" class="link_value" value="/yugiohdb/card_search.action?ope=2&amp;cid=14496">

We want for each list to extract the cid of each input, in the example 14496. The cid is the card_id in the table limitation.

If we encounter an error we want to log it and continue.
The generated code should be ran in index.js after syncCards().
If a list as already been scraped we should not scrap it again.
