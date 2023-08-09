function insertjQuery() {
    let jQueryScript = document.createElement('script');
    jQueryScript.src = 'https://code.jquery.com/jquery-3.7.0.min.js'
    document.getElementsByTagName('head')[0].appendChild(jQueryScript);
}
insertjQuery();

function insertNoneStyle() {
    const noneStyle = $('<style>.no-show { display: none !important }</style>');
    $('head').append(noneStyle);
}

const SIDEBAR_LIST = ['Domains', 'Regions', 'States'];
const NO_SHOW_CLASS = 'no-show'
const MAPPED_DATA_TYPE = {
    'Regions': 'region',
    'Domains': 'domain',
    'States': 'state',
}
const SELECTED_FILTER = {};

function getAllCards(type, allCards) {
    let css = '';
    if (!allCards) {
        css = ':not(.no-show)'
    }
    return $(`div[data-framer-name="Ministry Unit"]${css} div[data-framer-name="Metadata"] div[data-framer-name="${type}"] p`);
}

function traverseAndBuildSidebar() {
    const regionMetadata = getAllCards('region', false);
    const domainMetadata = getAllCards('domain', false);
    const stateMetadata = getAllCards('state', false);
    
    const uniqueRegionsPresent = [...new Set(regionMetadata.map((_, elem) => elem && elem.innerHTML))];
    const uniqueDomainPresent = [...new Set(domainMetadata.map((_, elem) => elem && elem.innerHTML))];
    const uniqueStatePresent = [...new Set(stateMetadata.map((_, elem) => elem && elem.innerHTML))];

    const sidebarData = {
        domains: uniqueDomainPresent,
        regions: uniqueRegionsPresent,
        states: uniqueStatePresent,
    };

    buildSidebars(sidebarData);
}

function buildSidebars(sidebarData) {
    buildSidebar(sidebarData.domains, 'Domains');
    buildSidebar(sidebarData.regions, 'Regions');
    buildSidebar(sidebarData.states, 'States');
}

function buildSidebar(existingData, type) {
    const sidebar = $(`div[data-framer-name="Sidebar"] div[data-framer-name="${type}"] p`);
    sidebar.map((_, elem) => {
        const sidebarData = elem.innerHTML;
        $elem = $(elem);
        const parentDiv = $elem.parent('div');
        if (existingData.indexOf(sidebarData) == -1) {
            parentDiv.hide(300);
        } else {
            parentDiv.show(300);
        }
    });
}

function hideAllNonSelectedCards(selectedData, type) {
    const $cards = getAllCards(type, false);
    $cards.map((_, elem) => {
        const sidebarData = elem.innerHTML;
        $elem = $(elem);
        $parentCard = $elem.parents('div[data-framer-name="Ministry Unit"]');
        if (selectedData != sidebarData) {
            $parentCard.addClass(NO_SHOW_CLASS);
        }
    });
    SELECTED_FILTER[type] = selectedData;
}

function reset(type) {
    const $cards = getAllCards(type, true);
    delete SELECTED_FILTER[type];
    $cards.map((_, elem) => {
        $elem = $(elem);
        $metaData = $elem.parents('div[data-framer-name="Metadata"]');
        $parentCard = $elem.parents('div[data-framer-name="Ministry Unit"]');
        const regionData = $metaData.find('div[data-framer-name="region"] p').text();
        const stateData = $metaData.find('div[data-framer-name="state"] p').text();
        const domainData = $metaData.find('div[data-framer-name="domain"] p').text();

        let shouldKeep = true;
        for (let [key, value] of Object.entries(SELECTED_FILTER)) {
            switch(key) {
                case 'region':
                    shouldKeep = value == regionData;
                    break;
                case 'domain':
                    shouldKeep = value == domainData;
                    break;
                case 'state':
                    shouldKeep = value == stateData;
                    break;
            }
        }

        if (shouldKeep) {
            $parentCard.removeClass(NO_SHOW_CLASS);
        } else {
            $parentCard.addClass(NO_SHOW_CLASS);
        }
    });
}

function filter(e) {
    const $clickedElem = $(e.currentTarget);
    const clickedData = $clickedElem.find('p').text();
    const dataType = $clickedElem.parent('div').attr('data-framer-name');
    const $resetButton = $clickedElem.parent('div').siblings('div[data-framer-name="Reset"]');
    $resetButton.show();
    hideAllNonSelectedCards(clickedData, MAPPED_DATA_TYPE[dataType]);
    traverseAndBuildSidebar()

}

function resetHandler(e) {
    const $clickedElem = $(e.currentTarget);
    const dataType = $clickedElem.parent('div').attr('data-framer-name');
    console.log(dataType);
    console.log(MAPPED_DATA_TYPE[dataType]);
    reset(MAPPED_DATA_TYPE[dataType]);
    $clickedElem.hide();
}

function init() {
    const $reset = $('div[data-framer-name="Sidebar"] div[data-framer-name="Reset"]');
    $reset.click(resetHandler);
    $reset.hide();
    SIDEBAR_LIST.forEach(sidebarType => {
        $(`div[data-framer-name="Sidebar"] div[data-framer-name="${sidebarType}"] div`).click(filter);
    });
}