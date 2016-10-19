/**
 * @fileOverview
 * @author sqchen
 * @version 1
 * Created: 15-6-3 上午11:26
 */
LBF.define('ui.widget.TimePicker.TimePickerTemplate', function() {
    return [
        '<% if(selectMode == "minute-mode") { %>',
        '   <a class="lbf-date-picker-btn-prev lbf-time-picker-btn-prev" href="javascript:;"></a>',
        '   <a class="lbf-date-picker-btn-next lbf-time-picker-btn-next" href="javascript:;"></a>',
        '<% } %>',
        '<div class="lbf-date-picker-viewport">',
        '    <table class="lbf-date-picker-time-table">',
        '        <% if(selectMode == "minute-mode") { %>',
        '           <caption class="lbf-date-picker-caption"><a href="javascript:" class="lbf-date-picker-caption-link" style="font-size: 16px;"><%== selectedHour %>:00</a></caption>',
        '        <% } %>',
        '        <tbody class="lbf-date-picker-time-tbody tbody-<%= selectMode %>">',
        '          <% if(selectMode == "hour-mode") { %>',
        '             <% for(var i = 0; i < 24; i++) { %>',
        '               <% if(i % 4 == 0) { %><tr><% } %>',
        '                  <td><a data-hour="<%== i %>" class="lbf-date-picker-time <% if(i == selectedHour) { %>lbf-date-picker-time-selected<% } %>"><%== i %>:00</a></td>',
        '               <% if(i % 4 == 3) { %></tr><% } %>',
        '             <% } %>',
        '          <% } else if(selectMode == "minute-mode") { %>',
        '             <% for(var i = 0; i < 60; i = i + 5) { %>',
        '               <% if(i % 4 * 5 == 0) { %><tr><% } %>',
        '                  <td><a data-minute="<%== i %>" class="lbf-date-picker-time <% if(i == selectedMinute && selectedHour == defaultHour) { %>lbf-date-picker-time-selected<% } %>"><%== selectedHour %>:<% if(i >= 10) { %><%== i %><% } else { %><%== "0" + i %><% } %></a></td>',
        '               <% if(i % 4 * 5 == 3) { %></tr><% } %>',
        '             <% } %>',
        '          <% } %>',
        '       </tbody>',
        '    </table>',
        '</div>'].join('');
});