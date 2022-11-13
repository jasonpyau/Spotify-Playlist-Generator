
heightChanged();

export function heightChanged() {
    setTimeout(changeHeight, 1);
}

window.heightChanged = heightChanged;

function changeHeight() {
    let MainSection = document.getElementById("MainSection");
    let MainArticle = document.getElementById("MainArticle");
    let SeedArticle = document.getElementById("SeedArticle");
    let LoginArticle = document.getElementById("LoginArticle");

    let MainArticleHeight = MainArticle.offsetHeight + 5;
    let LeftArticlesHeight = SeedArticle.offsetHeight + LoginArticle.offsetHeight + 10;
    if (window.innerWidth > 880) {
        if(MainArticleHeight > LeftArticlesHeight) {
            MainSection.style.height = MainArticleHeight + "px";
        }
        else {
            MainSection.style.height = LeftArticlesHeight + "px";
        }
    }
    else {
        MainSection.style.height = "calc("+MainArticle.offsetHeight +"px + "+ LoginArticle.offsetHeight +"px + " + SeedArticle.offsetHeight + "px + 10px";
    }
}

addEventListener('resize', function() {
    changeHeight();
});


