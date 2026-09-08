import * as cheerio from "cheerio";
import { extractValue } from "./extractValue";

export const extractServerDetails = (data: Buffer) => {
  const $ = cheerio.load(data);

  const stringData = data.toString();

  // Unraid 7.3+ wraps each dashboard tile's icon/heading in an extra
  // "tile-header" span, and renamed the box ids from db-box* to db_box*.
  // Selectors below are written to match on the unique title="..." attribute
  // of each tbody directly (skipping the box id) and to tolerate either the
  // old or new nesting, so they keep working across Unraid versions.

  const motherboard = $(
    '[title="Motherboard Information"] > tr:nth-child(2) > td'
  )
    .contents()
    .first()
    .text()
    .trim();

  let cpu = $('[title="Processor Information"] .tile-header-left .section')
    .first()
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .trim();
  if (!cpu) {
    cpu = $('[title="Processor Information"] > tr:nth-child(2) > td')
      .contents()
      .first()
      .text()
      .trim();
  }

  let memory = $('[title="Memory Utilization"] .head_info').first().text();
  if (!memory) {
    memory = $(
      '[title="Memory Utilization"] > tr:nth-child(1) > td > div > span'
    ).text();
  }
  memory = memory
    .replace("Memory: ", "")
    .replace(/RAM:(100|[1-9]?[0-9])%/, "")
    .trim();

  const diskSpace = $("#array_list .section span").first().text().trim();
  const cacheSpace = $("#pool_list0 .section span").first().text().trim();

  // The <unraid-user-profile> web component has carried the OS version under
  // different attributes across Unraid releases: "server" (HTML-entity
  // encoded JSON, newer) and "serverstate" (URL-encoded JSON, older). Fall
  // back to the legacy plain-text marker for anything older still.
  let version = "";
  const userProfile = $("unraid-user-profile");
  try {
    const server = userProfile.attr("server");
    if (server) version = JSON.parse(server).osVersion || "";
  } catch (e) {
    // ignore and try the next source
  }
  if (!version) {
    try {
      const serverstate = userProfile.attr("serverstate");
      if (serverstate) {
        version = JSON.parse(decodeURIComponent(serverstate)).osVersion || "";
      }
    } catch (e) {
      // ignore and try the next source
    }
  }
  if (!version) {
    const legacyVersion = extractValue(stringData, "Version: ", "&nbsp;");
    version = legacyVersion.length < 10 ? legacyVersion : "";
  }

  const details = {
    title: extractValue(stringData, "title>", "/"),
    cpu,
    memory,
    motherboard,
    diskSpace,
    cacheSpace,
    version
  };

  return details;
};
