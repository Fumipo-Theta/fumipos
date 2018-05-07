import * as $ from 'jquery';
const jquery = $;
const jQuery = $;
window.jQuery = $;
window.$ = $;
import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/mouse';


require('jquery-ui-touch-punch');
import fumiposAPI from "./fumiposAPI"

window.fumiposAPI = fumiposAPI;