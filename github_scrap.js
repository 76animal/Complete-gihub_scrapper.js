require("chromedriver");
const fs = require("fs");
let wd = require("selenium-webdriver");
let browser = new wd.Builder().forBrowser('chrome').build();
let finalData = [];
let totalProjects = 0;
let projectscovered = 0;
async function getProjectURLs(url,i)
{
    let browser = new wd.Builder().forBrowser('chrome').build();
    await browser.get(url);
    await browser.wait(wd.until.elementsLocated(wd.By.css("a.text-bold")));  // safety condition sare projectboxes jab tak nikal na lo tab tak broswer ko bolo wait kre
    let projectBoxes = await browser.findElements(wd.By.css("a.text-bold")); // sare project nikal la each  topic ke
     totalProjects += ((projectBoxes.length>8) ? 8 : projectBoxes.length);
    finalData[i]["projects"] = [];
    for(let j in projectBoxes)
    {
        if(j==8)
        {
            break;
        }
        finalData[i].projects.push({"projectURL" : await projectBoxes[j].getAttribute("href")});
    }
    
    let projects = finalData[i]["projects"];
    for(let k in projects)
    {
        getIssues(projects[k].projectURL,i,k);
    }
    browser.close();
}

async function getIssues(url,i,j)
{
    let browser = new wd.Builder().forBrowser('chrome').build();
    await browser.get( url + "/issues");
    let currUrl = await browser.getCurrentUrl();
    finalData[i].projects[j]["issues"] = [];
    if( currUrl.localeCompare(url + "/issues") != 0 )
    {
        browser.close();
        finalData[i].projects[j]["issues"][0] = "No issues found";
        fs.writeFileSync("finalData.json", JSON.stringify(finalData));
        return;
    }
    // await browser.wait(wd.until.elementsLocated(wd.By.css(".v-align-middle.no-underline"))); 
    let issueBoxes = await browser.findElements(wd.By.css(".v-align-middle.no-underline"));
    
    if(issueBoxes.length == 0)
    {
        browser.close();
        finalData[i].projects[j]["issues"][0] = "No issues found";
        fs.writeFileSync("finalData.json", JSON.stringify(finalData));
        return;
    }
    for(let l in issueBoxes)
    {
        if(l==8)
        {
            break;
        }
        let heading = await issueBoxes[l].getAttribute("innerText");
        let issueURL = await issueBoxes[l].getAttribute("href");
        finalData[i].projects[j].issues.push({"heading":heading,"url":issueURL});
    }

    projectscovered += 1;
    if(projectscovered == totalProjects)
    {
        fs.writeFileSync("finalData.json", JSON.stringify(finalData));
    }

    browser.close();
}
async function main(){
    await browser.get(`https://github.com/topics`);

    await browser.wait(wd.until.elementsLocated(wd.By.css(".no-underline.d-flex.flex-column")));
    let topicBoxes = await browser.findElements(wd.By.css(".no-underline.d-flex.flex-column"));
    
    for(let topicBox of topicBoxes)
    {
        finalData.push({ topicURL : await topicBox.getAttribute("href")});
    }
    
    for(let i in finalData)
    {
        getProjectURLs(finalData[i].topicURL,i);
    }
   browser.close();
}

main();
