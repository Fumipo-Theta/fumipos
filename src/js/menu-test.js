
export const template = _ => `
  <label for="inp" class="inp">
    <input type="text" id="inp" placeholder="&nbsp;">
    <span class="label">お名前</span>
    <span class="border"></span>
  </label>
  `;

export const eventSetter = (_, __) => {

};

export const option = {
  label: "Test menu",
  draggable: true
}

export const style = `
    width : 400px;
  `
