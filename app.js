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
let refreshForecast = () => {};

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
    const revenue = Number(document.querySelector('#total-revenue')?.value) || 0;
    const orderValue = Number(document.querySelector('#order-value')?.value) || 0;
    const customers = orderValue > 0 ? Math.ceil(revenue / orderValue) : 0;
    const leads = leadRate > 0 ? Math.ceil(customers * 100 / leadRate) : 0;
    const prospects = prospectRate > 0 ? Math.ceil(leads * 100 / prospectRate) : 0;

    return { prospects, leads, customers, prospectRate, leadRate };
  };

  const showTooltip = (row) => {
    const month = Number(row.dataset.month);
    const forecast = getForecast();
    const prospects = forecast.prospects > 0 ? Math.ceil(chartValues[month - 1] * forecast.prospects / 105) : 0;
    const leads = forecast.prospectRate > 0 ? Math.ceil(prospects * forecast.prospectRate / 100) : 0;
    const customers = forecast.leadRate > 0 ? Math.floor(leads * forecast.leadRate / 100) : 0;
    chartTooltip.innerHTML = `<strong>Month #${month}</strong><span>Prospects: ${prospects}</span><span>Leads: ${leads}</span><span>Customers: ${customers}</span>`;
  };

  const updateForecast = () => {
    const forecast = getForecast();
    const prospectShare = forecast.prospects / maximumProspects * 100;
    const leadShare = forecast.prospects ? forecast.leads / forecast.prospects * 100 : 0;

    setMetric('prospects', forecast.prospects, 100);
    setMetric('leads', forecast.leads, forecast.prospectRate);
    const customerRate = forecast.prospects > 0 ? forecast.customers / forecast.prospects * 100 : 0;
    setMetric('customers', forecast.customers, customerRate);

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
  refreshForecast = updateForecast;
  updateForecast();
}

const campaignForm = document.querySelector('#campaign-form');

if (campaignForm) {
  const currency = document.querySelector('#currency');
  const start = document.querySelector('#campaign-start');
  const end = document.querySelector('#campaign-end');
  const revenue = document.querySelector('#total-revenue');
  const orderValue = document.querySelector('#order-value');
  const symbols = document.querySelectorAll('.currency-symbol');

  campaignForm.addEventListener('submit', (event) => event.preventDefault());

  const updateCampaignFields = () => {
    const symbol = currency.options[currency.selectedIndex].dataset.symbol;
    symbols.forEach((element) => { element.textContent = symbol; });
    end.min = start.value;
    if (start.value && end.value && end.value < start.value) end.value = start.value;
    refreshForecast();
  };

  campaignForm.addEventListener('input', updateCampaignFields);
  currency.addEventListener('change', updateCampaignFields);
  updateCampaignFields();
}
