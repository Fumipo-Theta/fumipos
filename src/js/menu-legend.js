
export  const template = uiState => `
  <style>
  #form_legend input.button{
    cursor: pointer;
    min-width: 10vw;
    font-size: 1.5rem;
    margin: 5px 0px;
    padding: 10px;
  }


  #legend_form{
    margin: 5px;
  }

    #legend_table{
      margin: 0px;  
    }

      #legend_table input.color{
        background-color: #fff;
        border: none;
        padding:0px;
      }

      #legendKey{
        color: #fff;
        background: none;
        border:none;
        font-weight: bold;
        text-align: center;
      }

  </style>

  <div id="legend_form">
  <form name="form_legend" id="form_legend">
    <a href="#" class="close_button" id="close_legendForm"></a>
    <hr style="visibility:hidden">
    <label class="file" for="legendJSON">
      Select legend file(.JSON)
      <input id="legendJSON" type="file" accept=".json" style="display:none;">
    </label>
    <input id="legendAutoLoad" type='button' style="display:none;">
    <hr>
    Selected file:
    <span id="legendFileLabel"></span>
    <hr>
    <input id="hideAll_button" class="button" type="button" value="Hide all">
    <input id="showAll_button" class="button" type="button" value="Show all">
  </form>
</div>

<div id="legend_table">
</div>
  `;

export  const eventSetter = (emmiter, uiState) => {

  }

export  const option = {
    label: "Legend",
    draggable: false
  }

 export const style = `
  left: 25%;
  min-width: 25vw;
  `;

