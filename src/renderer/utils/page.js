async function changePage(id) {
  let page = document.querySelector(`#${id}-page`);
  let active = document.querySelector(`.active`);
  if (active) active.classList.toggle("active");
  page.classList.add("active");
}

module.exports = {
  changePage,
};
