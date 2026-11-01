// jsdom does not implement the <dialog> methods yet, so we simulate them with the "open" attribute
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open')
}