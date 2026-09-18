document.querySelectorAll('input[type="range"]').forEach((range) => {
  const output = document.querySelector(`#${range.id.replace('-rate', '-output')}`);

  const updateOutput = () => {
    const minimum = Number(range.min) || 0;
    const maximum = Number(range.max) || 100;
    const value = Math.min(maximum, Math.max(minimum, Number(range.value) || 0));
    const percentage = ((value - minimum) / (maximum - minimum || 1)) * 100;
    const formattedValue = `${value.toFixed(2)}%`;

    range.value = value;
    range.style.setProperty('--rate-progress', `${percentage}%`);
    if (output) {
      output.value = formattedValue;
      output.textContent = formattedValue;
    }
  };

  range.addEventListener('input', updateOutput);
  range.addEventListener('change', updateOutput);
  updateOutput();
});

const forecastRows = document.querySelectorAll('.bar-row[data-month]');
const chartTooltip = document.querySelector('#chart-tooltip');
const leadRateInput = document.querySelector('#lead-response-rate');
const prospectRateInput = document.querySelector('#prospect-response-rate');

if (forecastRows.length && chartTooltip) {
  const chartValues = [20, 35, 55, 70, 85, 105];
  const maximumProspects = 120;
  const metricElements = {
    prospects: [document.querySelector('#prospects-total'), document.querySelector('#prospects-rate'), document.querySelector('#prospects-progress')],
    leads: [document.querySelector('#leads-total'), document.querySelector('#leads-rate'), document.querySelector('#leads-progress')],
    customers: [document.querySelector('#customers-total'), document.querySelector('#customers-rate'), document.querySelector('#customers-progress')],
  };

  const setMetric = (metric, value, rate) => {
    const [total, percentage, progress] = metricElements[metric];
    if (!total || !percentage || !progress) return;
    total.textContent = value;
    percentage.textContent = `${rate.toFixed(0)}%`;
    progress.style.width = `${Math.min(100, rate)}%`;
  };

  const getForecast = () => {
    const prospectRate = Number(prospectRateInput?.value) || 0;
    const leadRate = Number(leadRateInput?.value) || 0;
    const prospects = 125;
    const leads = Math.round(prospects * prospectRate / 100);
    const customers = Math.round(leads * leadRate / 100);

    return { prospects, leads, customers, prospectRate, leadRate };
  };

  const showTooltip = (row) => {
    const month = Number(row.dataset.month);
    const forecast = getForecast();
    const prospects = Math.round(chartValues[month - 1] * forecast.prospects / 125);
    const leads = Math.round(prospects * forecast.prospectRate / 100);
    const customers = Math.round(leads * forecast.leadRate / 100);
    chartTooltip.innerHTML = `<strong>Month #${month}</strong><span>Prospects: ${prospects}</span><span>Leads: ${leads}</span><span>Customers: ${customers}</span>`;
  };

  const updateForecast = () => {
    const forecast = getForecast();
    const prospectShare = forecast.prospects / maximumProspects * 100;
    const leadShare = forecast.leadRate ? forecast.leads / forecast.prospects * 100 : 0;

    setMetric('prospects', forecast.prospects, 100);
    setMetric('leads', forecast.leads, forecast.prospectRate);
    setMetric('customers', forecast.customers, forecast.prospectRate * forecast.leadRate / 100);

    forecastRows.forEach((row, index) => {
      const bar = row.querySelector('.bar');
      const monthlyProspects = chartValues[index];
      bar.style.setProperty('--bar-width', `${monthlyProspects / maximumProspects * 100}%`);
      bar.style.setProperty('--lead-width', `${leadShare}%`);
      row.setAttribute('aria-label', `Month ${index + 1}: ${monthlyProspects} prospects`);
    });

    const activeRow = document.querySelector('.bar-row.is-active') || forecastRows[2];
    if (activeRow) showTooltip(activeRow);
  };

  forecastRows.forEach((row) => {
    row.addEventListener('mouseenter', () => showTooltip(row));
    row.addEventListener('focus', () => showTooltip(row));
    row.addEventListener('click', () => {
      forecastRows.forEach((item) => item.classList.remove('is-active'));
      row.classList.add('is-active');
      showTooltip(row);
    });
  });

  leadRateInput?.addEventListener('input', updateForecast);
  prospectRateInput?.addEventListener('input', updateForecast);
  updateForecast();
}

const campaignForm = document.querySelector('#campaign-form');

if (campaignForm) {
  const currency = document.querySelector('#currency');
  const campaignStart = document.querySelector('#campaign-start');
  const campaignEnd = document.querySelector('#campaign-end');
  const totalRevenue = document.querySelector('#total-revenue');
  const orderValue = document.querySelector('#order-value');
  const currencySymbols = document.querySelectorAll('.currency-symbol');
  const summary = document.querySelector('#campaign-summary');
  const detail = document.querySelector('#campaign-detail');
  const status = document.querySelector('.summary-status');

  const formatMoney = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

  const formatDate = (value) => new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));

  const updateCampaignSummary = () => {
    const start = new Date(`${campaignStart.value}T00:00:00`);
    const end = new Date(`${campaignEnd.value}T00:00:00`);
    const revenue = Number(totalRevenue.value);
    const averageOrder = Number(orderValue.value);
    const validDates = campaignStart.value && campaignEnd.value && end >= start;
    const validNumbers = revenue >= 0 && averageOrder > 0;

    campaignEnd.min = campaignStart.value;
    status.classList.toggle('is-invalid', !validDates || !validNumbers);
    status.textContent = validDates && validNumbers ? 'Ready' : 'Check values';

    if (!validDates) {
      summary.textContent = 'Campaign end must be after the start date.';
      detail.textContent = 'Choose a valid campaign period to continue.';
      return;
    }

    const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.4375)));
    const estimatedOrders = Math.floor(revenue / averageOrder);
    summary.textContent = `${months} month${months === 1 ? '' : 's'} · ${formatMoney(revenue)} revenue target`;
    detail.textContent = `${formatDate(campaignStart.value)} to ${formatDate(campaignEnd.value)} · Average order value: ${formatMoney(averageOrder)} · Estimated orders: ${estimatedOrders}`;
  };

  const updateCurrency = () => {
    const symbol = currency.options[currency.selectedIndex].dataset.symbol;
    currencySymbols.forEach((element) => { element.textContent = symbol; });
    updateCampaignSummary();
  };

  campaignForm.addEventListener('input', updateCampaignSummary);
  currency.addEventListener('change', updateCurrency);
  updateCurrency();
}
