/* ============================================================================
   PANIER — Gaming Accessoires
   Ajoute un bouton « + Panier » sur chaque fiche et une barre de panier flottante.
   Aucune modification du HTML des fiches : tout est injecté ici, donc les produits
   ajoutés plus tard par le dashboard en profitent automatiquement.
   ========================================================================== */
(function () {
  var CLE = "ga_panier_v1";
  var WA = "213780078678";

  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)) || []; } catch (e) { return []; }
  }
  function ecrire(p) {
    try { localStorage.setItem(CLE, JSON.stringify(p)); } catch (e) {}
    majBarre();
  }
  function nombre(p) { return p.reduce(function (n, a) { return n + (a.qte || 1); }, 0); }
  function total(p) { return p.reduce(function (n, a) { return n + (a.prix || 0) * (a.qte || 1); }, 0); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Da"; }

  function ajouter(article) {
    var p = lire();
    var i = p.findIndex(function (a) { return a.img === article.img; });
    if (i >= 0) { p[i].qte = (p[i].qte || 1) + 1; }
    else { article.qte = 1; p.push(article); }
    ecrire(p);
    pulse();
  }

  /* --- récupère les infos d'une fiche produit depuis son DOM --- */
  function infos(carte) {
    var img = carte.querySelector("img");
    var t = carte.querySelector("h3");
    var prixTxt = carte.querySelector(".price");
    var prix = prixTxt ? parseInt(String(prixTxt.textContent).replace(/[^\d]/g, ""), 10) || 0 : 0;
    return {
      img: img ? (img.getAttribute("src") || "") : "",
      nom: t ? t.textContent.trim() : "Stand",
      prix: prix,
      cat: carte.getAttribute("data-cat") || "",
      ref: carte.getAttribute("data-ref") || ""
    };
  }

  /* --- bouton « + Panier » injecté dans chaque fiche --- */
  function injecterBoutons() {
    var cartes = document.querySelectorAll(".card");
    for (var i = 0; i < cartes.length; i++) {
      var carte = cartes[i];
      if (carte.querySelector(".btn-panier")) continue;
      var zone = carte.querySelector("a.btn") || carte.querySelector("a");
      if (!zone) continue;
      var b = document.createElement("button");
      b.className = "btn-panier";
      b.type = "button";
      b.title = "Ajouter au panier";
      b.innerHTML = "🛒 + Panier";
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        ajouter(infos(this.closest(".card")));
      });
      zone.parentNode.insertBefore(b, zone.nextSibling);
    }
  }

  /* --- barre flottante --- */
  var barre = null;
  function majBarre() {
    var p = lire();
    if (!barre) {
      barre = document.createElement("div");
      barre.id = "barre-panier";
      barre.style.cssText =
        "position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:9999;" +
        "display:none;align-items:center;gap:12px;background:#111827;color:#fff;" +
        "padding:12px 16px;border-radius:999px;box-shadow:0 12px 30px rgba(0,0,0,.35);" +
        "font:600 14px -apple-system,Segoe UI,Roboto,sans-serif;border:1px solid rgba(255,255,255,.12)";
      document.body.appendChild(barre);
    }
    if (!p.length) { barre.style.display = "none"; return; }
    barre.style.display = "flex";
    barre.innerHTML =
      '<span>🛒 ' + nombre(p) + " article" + (nombre(p) > 1 ? "s" : "") +
      " · " + fmt(total(p)) + "</span>" +
      '<a href="commander.html" style="background:#22c55e;color:#04211f;text-decoration:none;' +
      'padding:8px 14px;border-radius:999px;font-weight:800">Commander</a>' +
      '<button type="button" id="vider-panier" style="background:transparent;border:0;color:#8fa0bb;' +
      'font:inherit;cursor:pointer;font-size:12px">vider</button>';
    var v = document.getElementById("vider-panier");
    if (v) v.addEventListener("click", function () { if (confirm("Vider le panier ?")) ecrire([]); });
  }

  function pulse() {
    majBarre();
    if (!barre) return;
    barre.style.transform = "translateX(-50%) scale(1.06)";
    setTimeout(function () { barre.style.transform = "translateX(-50%) scale(1)"; }, 160);
  }

  function demarrer() {
    injecterBoutons();
    majBarre();
    /* le dashboard peut re-rendre la grille : on surveille */
    var grille = document.getElementById("grid") || document.querySelector(".grid");
    if (grille && window.MutationObserver) {
      new MutationObserver(function () { injecterBoutons(); }).observe(grille, { childList: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
