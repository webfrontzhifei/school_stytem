/**
 * Created by byronbinli.
 * Date: 16/6/13.
 * Time: 19:11.
 * Content:
 */
/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-14 下午2:43
 */
LBF.define('qidian.comp.DatePicker.DatePickerTemplate', function(){
    return [
        '<a class="lbf-date-picker-btn-prev <%==selectMode%>" href="javascript:;"></a>',
        '<a class="lbf-date-picker-btn-next <%==selectMode%>" href="javascript:;"></a>',
        '<div class="lbf-date-picker-viewport">',
        '<% if(selectMode == "date-mode") {%>',// mode for selecting date of the month
        '<% for(var viewIndex = 0, cDate = viewStartDateInstance, daysThisMonth, day; viewIndex < monthStep; viewIndex++){ %>',
        '<% daysThisMonth = isLeapYear(cDate) && cDate.getMonth() === 1 ? 29 : DAYS_IN_MONTH[cDate.getMonth()]; %>',
        '<table class="lbf-date-picker-table">',
        '<caption class="lbf-date-picker-caption"><a class="lbf-date-picker-caption-link"><%== dateFormat(monthFormat, cDate) %></a></caption>',
        '<thead>',
        '<th class="lbf-date-picker-weekday">日</th>',
        '<th class="lbf-date-picker-weekday">一</th>',
        '<th class="lbf-date-picker-weekday">二</th>',
        '<th class="lbf-date-picker-weekday">三</th>',
        '<th class="lbf-date-picker-weekday">四</th>',
        '<th class="lbf-date-picker-weekday">五</th>',
        '<th class="lbf-date-picker-weekday">六</th>',
        '</thead>',
        '<tbody>',
        '<% day = cDate.getDay(); %>',
        '<% if(day !== 0) { %>',
        '<tr class="lbf-date-picker-week">',
        '<% } %>',
        '<% for(var i=day; i--;){ %>',
        '<td class="lbf-date-picker-date lbf-date-picker-date-blank"></td>',
        '<% } %>',
        '<% for(var j=daysThisMonth; j--; cDate = nextDay(cDate)){ %>',
        '<% day = cDate.getDay(); %>',
        '<% if(day === 0){ %>',
        '<tr>',
        '<% } %>',
        '<td data-date="<%== +cDate %>" class="lbf-date-picker-date lbf-date-picker-date-num <%== isHighlighted(cDate) ? "lbf-date-picker-date-highlight" : ""%> <%== isDayEnabled(cDate) ? "lbf-date-picker-date-enabled" : "lbf-date-picker-date-disabled"%> <%== isDaySelected(cDate) ? "lbf-date-picker-date-selected" : ""%>"><%== cDate.getDate() %></td>',
        '<% if(day === 6){ %>',
        '</tr>',
        '<% } %>',
        '<% } %>',
        '<% for(var k=6 - day; k--;){ %>',
        '<td class="lbf-date-picker-date lbf-date-picker-date-blank"></td>',
        '<% } %>',
        '</tbody>',
        '</table>',
        '<% } %>',
        '<% } else if(selectMode === "month-mode") {%>', //mode for selecting month of the year
        '<% var cDate = viewStartDateInstance; %>',
        '<table class="lbf-date-picker-table lbf-date-picker-month-table">',
        '<caption class="lbf-date-picker-caption"><a class="lbf-date-picker-caption-link"><%== dateFormat(yearFormat, cDate) %></a></caption>',
        '<tbody>',
        '<% var monthsArr = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]], monthsNameHash = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];%>',
        '<% for(var thirdIndex = 0, monthsArrLength = monthsArr.length; thirdIndex < monthsArrLength; thirdIndex++) {%>',
        '<tr>',
        '<% var months = monthsArr[thirdIndex]; %>',
        '<% for(var monthsIndex = 0, monthsLength = months.length; monthsIndex < monthsLength; monthsIndex++) {%>',
        '<% var compareDate = dateInstance; compareDate.setYear(cDate.getFullYear()); compareDate.setDate(1); compareDate.setMonth(months[monthsIndex]);%>',
        '<td><a class="lbf-date-picker-month <%== isMonthEnabled(compareDate) ? " lbf-date-picker-month-enabled" : "lbf-date-picker-month-disabled" %> <%== isMonthSelected(compareDate) ? " lbf-date-picker-month-selected" : "" %>" data-month="<%=== +(cDate.setMonth(months[monthsIndex])) %>"><%==monthsNameHash[months[monthsIndex]] %></a></td>',
        '<% }%>',
        '</tr>',
        '<% }%>',
        '</tbody>',
        '</table>',

        '<% } else if(selectMode === "year-mode") {%>', //mode for selecting year of the decade
        '<% var cDate = viewStartDateInstance, decadeRange = getDecadeRange(cDate);%>',
        '<table class="lbf-date-picker-table lbf-date-picker-year-table">',
        '<caption class="lbf-date-picker-caption"><a class="lbf-date-picker-caption-link"><%== decadeRange.rangeText %></a></caption>',
        '<tbody>',
        '<% for(var yearStart = decadeRange.startYear, lineItem = 0; yearStart <= decadeRange.endYear; yearStart++) {%>',
        '<% if(lineItem === 0) {%>',
        '<tr>',
        '<% }%>',
        '<% var compareDate = dateInstance; compareDate.setYear(yearStart); %>',
        '<td><a class="lbf-date-picker-year <%== isYearEnabled(compareDate) ? " lbf-date-picker-year-enabled" : "lbf-date-picker-year-disabled" %> <%== isYearSelected(compareDate) ? " lbf-date-picker-year-selected" : "" %> <%== yearStart === decadeRange.startYear ? " lbf-date-picker-year-first" : ""%> <%== yearStart === decadeRange.endYear ? " lbf-date-picker-year-last": ""%>" data-year="<%=== +(cDate.setYear(yearStart))%>"><%== yearStart %></a></td>',
        '<% if(lineItem === 3) {%>',
        '</tr>',
        '<% lineItem = 0;%>',
        '<% } else {%>',
        '<% lineItem++;%>',
        '<% }%>',
        '<% }%>',
        '</tbody>',
        '</table>',
        '<% } %>',
        '</div>',
        '<div data-date="<%== +dateInstance %>" class="lbf-date-picker-today-link lbf-date-picker-date-enabled">今天</div>'
    ].join('');
});