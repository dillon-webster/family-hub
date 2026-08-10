/* @ds-bundle: {"format":3,"namespace":"CraveCraftedDesignSystem_7104dc","components":[],"sourceHashes":{"ui_kits/app/App.jsx":"a75ac09ce879","ui_kits/app/Detail.jsx":"e5d08ef60d66","ui_kits/app/Discover.jsx":"f1536a034e38","ui_kits/app/Library.jsx":"f9647658c64b","ui_kits/app/Scan.jsx":"34253ae9f15d","ui_kits/app/ios-frame.jsx":"39f3a091d97d","ui_kits/app/recipes.jsx":"95853481d53f","ui_kits/app/tweaks-panel.jsx":"6591467622ed","ui_kits/app/ui.jsx":"3b88350c3dfe","ui_kits/app/units.jsx":"aa3841b907aa"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CraveCraftedDesignSystem_7104dc = window.CraveCraftedDesignSystem_7104dc || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/app/App.jsx
try { (() => {
// App.jsx — Crave Crafted app shell: routing, accent personalization, toast

const ACCENTS = {
  Paprika: {
    primary: '#C8553D',
    hover: '#B8492F',
    press: '#A23F29',
    soft: '#F7E4D9',
    softer: '#FBF0E9'
  },
  Saffron: {
    primary: '#E0A23C',
    hover: '#CE9030',
    press: '#B97A22',
    soft: '#FAEDD2',
    softer: '#FDF6E9'
  },
  Basil: {
    primary: '#6E8B57',
    hover: '#5F7B4A',
    press: '#50683E',
    soft: '#E5EAD9',
    softer: '#F1F4E9'
  },
  'Sea salt': {
    primary: '#2F8C8C',
    hover: '#277878',
    press: '#1F6464',
    soft: '#D6ECEC',
    softer: '#ECF6F6'
  },
  Plum: {
    primary: '#9B5675',
    hover: '#884965',
    press: '#743C55',
    soft: '#EEDDE6',
    softer: '#F7EFF3'
  },
  Blueberry: {
    primary: '#3F6FB0',
    hover: '#36619C',
    press: '#2D5285',
    soft: '#DCE7F4',
    softer: '#EDF3FA'
  }
};
function ThemeToggle({
  theme,
  onTheme
}) {
  const opt = (id, icon, label) => /*#__PURE__*/React.createElement("button", {
    onClick: () => onTheme(id),
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      border: 'none',
      cursor: 'pointer',
      borderRadius: 8,
      padding: '9px 0',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 14,
      background: theme === id ? 'var(--card)' : 'transparent',
      color: theme === id ? 'var(--ink)' : 'var(--ink-3)',
      boxShadow: theme === id ? 'var(--shadow-xs)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    color: theme === id ? 'var(--primary)' : 'var(--ink-3)'
  }), label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'var(--paper-3)',
      borderRadius: 'var(--r-sm)',
      padding: 3,
      gap: 3
    }
  }, opt('light', 'sun', 'Light'), opt('dark', 'moon', 'Dark'));
}
function BundleCard({
  owned,
  onBuy
}) {
  if (owned) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 'var(--r-lg)',
        border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--card))',
        background: 'color-mix(in srgb, var(--primary) 10%, var(--card))',
        boxShadow: 'var(--shadow-sm)',
        padding: '15px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 'var(--r-md)',
        background: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 20,
      color: "var(--on-primary)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "body-strong",
      style: {
        fontSize: 15.5
      }
    }, "Everything bundle"), /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        marginTop: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check-circle",
      size: 13,
      color: "var(--accent)"
    }), "All features unlocked \xB7 thank you!")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--r-lg)',
      border: '1.5px solid var(--primary)',
      background: 'color-mix(in srgb, var(--primary) 10%, var(--card))',
      boxShadow: 'var(--shadow-sm)',
      padding: '16px 16px 17px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 13,
      right: 14,
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      color: 'var(--on-primary)',
      background: 'var(--accent)',
      padding: '3px 8px',
      borderRadius: 'var(--r-pill)'
    }
  }, "Best value"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--r-sm)',
      background: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 18,
    color: "var(--on-primary)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 19,
      color: 'var(--ink)'
    }
  }, "Everything bundle")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      marginBottom: 13
    }
  }, ['Remove all ads', 'Save web recipes to your cookbook'].map(l => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 9,
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "numeric",
    style: {
      fontSize: 26,
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, "$9.99"), /*#__PURE__*/React.createElement("span", {
    className: "numeric",
    style: {
      fontSize: 14,
      color: 'var(--ink-3)',
      textDecoration: 'line-through'
    }
  }, "$12.98"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 12,
      color: 'var(--accent-hover)'
    }
  }, "Save $2.99")), /*#__PURE__*/React.createElement(Btn, {
    kind: "primary",
    full: true,
    onClick: onBuy
  }, "Unlock both"));
}
function PurchaseCard({
  icon,
  title,
  desc,
  price,
  owned,
  onBuy
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--r-lg)',
      border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--card))',
      background: 'color-mix(in srgb, var(--primary) 6%, var(--card))',
      boxShadow: 'var(--shadow-sm)',
      padding: '15px 15px',
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--r-md)',
      background: owned ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 16%, var(--card))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: owned ? 'check' : icon,
    size: 20,
    color: owned ? 'var(--on-primary)' : 'var(--primary)'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      fontSize: 15.5
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "small",
    style: {
      marginTop: 2
    }
  }, desc)), owned ? /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 12.5,
      color: 'var(--accent-hover)',
      background: 'var(--accent-soft)',
      padding: '7px 12px',
      borderRadius: 'var(--r-pill)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14,
    color: "var(--accent-hover)"
  }), "Owned") : /*#__PURE__*/React.createElement("button", {
    onClick: onBuy,
    style: {
      flexShrink: 0,
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      fontSize: 14,
      color: 'var(--on-primary)',
      background: 'var(--primary)',
      border: 'none',
      borderRadius: 'var(--r-pill)',
      padding: '9px 15px',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-xs)'
    }
  }, price));
}
function YouScreen({
  accent,
  onAccent,
  onClose,
  userName = 'Maya',
  onUserName,
  cookbookName = 'My Cookbook',
  onCookbookName,
  theme = 'light',
  onTheme,
  adFree = false,
  canSave = false,
  onBuyAdFree,
  onBuySaving,
  onBuyBundle,
  onOpenSetting
}) {
  const initial = (userName || 'M').trim()[0].toUpperCase();
  const fullName = userName && userName.trim() ? userName.trim() : 'Your name';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 130
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--r-pill)',
      border: 'none',
      background: 'var(--paper-3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    color: "var(--ink-2)"
  })), /*#__PURE__*/React.createElement("span", {
    className: "overline"
  }, "Profile"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 25
    }
  }, initial), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "h3",
    style: {
      fontSize: 21
    }
  }, fullName), /*#__PURE__*/React.createElement("div", {
    className: "small"
  }, "68 recipes saved"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 10
    }
  }, "Your name"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      padding: '16px 16px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--ink-3)',
      display: 'block',
      marginBottom: 9
    }
  }, "Display name"), /*#__PURE__*/React.createElement("input", {
    value: userName,
    onChange: e => onUserName && onUserName(e.target.value),
    placeholder: "Your name",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 19,
      color: 'var(--ink)',
      background: 'var(--paper-3)',
      border: '1.5px solid transparent',
      borderRadius: 'var(--r-sm)',
      padding: '12px 14px',
      outline: 'none'
    },
    onFocus: e => e.target.style.borderColor = 'var(--primary)',
    onBlur: e => e.target.style.borderColor = 'transparent'
  }), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '10px 0 0'
    }
  }, "Shown on your profile and used for your avatar."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 10
    }
  }, "Your cookbook"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      padding: '16px 16px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--ink-3)',
      display: 'block',
      marginBottom: 9
    }
  }, "Cookbook name"), /*#__PURE__*/React.createElement("input", {
    value: cookbookName,
    onChange: e => onCookbookName && onCookbookName(e.target.value),
    placeholder: "My Cookbook",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 19,
      color: 'var(--ink)',
      background: 'var(--paper-3)',
      border: '1.5px solid transparent',
      borderRadius: 'var(--r-sm)',
      padding: '12px 14px',
      outline: 'none'
    },
    onFocus: e => e.target.style.borderColor = 'var(--primary)',
    onBlur: e => e.target.style.borderColor = 'transparent'
  }), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '10px 0 0'
    }
  }, "Shown as the title at the top of your cookbook."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 10
    }
  }, "Appearance"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      padding: '16px 16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      marginBottom: 10
    }
  }, "Theme"), /*#__PURE__*/React.createElement(ThemeToggle, {
    theme: theme,
    onTheme: onTheme
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      marginBottom: 3
    }
  }, "Accent color"), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '0 0 14px'
    }
  }, "Pick the color that flavors your whole app."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, Object.entries(ACCENTS).map(([name, a]) => /*#__PURE__*/React.createElement("button", {
    key: name,
    onClick: () => onAccent(name),
    title: name,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 'var(--r-pill)',
      background: a.primary,
      boxShadow: 'var(--shadow-sm)',
      outline: accent === name ? '3px solid var(--ink)' : '3px solid transparent',
      outlineOffset: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 10.5,
      fontWeight: 600,
      color: accent === name ? 'var(--ink)' : 'var(--ink-3)'
    }
  }, name))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "overline"
  }, "Unlock features"), /*#__PURE__*/React.createElement("span", {
    className: "caption"
  }, "One-time purchases")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(BundleCard, {
    owned: adFree && canSave,
    onBuy: onBuyBundle
  }), /*#__PURE__*/React.createElement(PurchaseCard, {
    icon: "ban",
    title: "Remove ads",
    desc: "Cook with no banner ads, anywhere.",
    price: "$4.99",
    owned: adFree,
    onBuy: onBuyAdFree
  }), /*#__PURE__*/React.createElement(PurchaseCard, {
    icon: "bookmark",
    title: "Web recipe saving",
    desc: "Save Discover recipes to your cookbook.",
    price: "$7.99",
    owned: canSave,
    onBuy: onBuySaving
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, [['ruler', 'Units & measurements', 'units'], ['circle-help', 'Help & feedback', 'help']].map(([ic, l, route], i, arr) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => onOpenSetting && onOpenSetting(route),
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      padding: '14px 15px',
      borderRadius: i === 0 ? 'var(--r-md) var(--r-md) 0 0' : i === arr.length - 1 ? '0 0 var(--r-md) var(--r-md)' : 0,
      borderTop: i === 0 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 19,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, l), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--ink-3)"
  })))));
}
function SubHeader({
  title,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--r-pill)',
      border: 'none',
      background: 'var(--paper-3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    color: "var(--ink-2)"
  })), /*#__PURE__*/React.createElement("span", {
    className: "overline"
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38
    }
  }));
}
function UnitsScreen({
  onClose,
  units,
  onUnits
}) {
  const system = units.system,
    temp = units.temp,
    fractions = units.fractions;
  const setSystem = v => onUnits({
    ...units,
    system: v
  });
  const setTemp = v => onUnits({
    ...units,
    temp: v
  });
  const setFractions = v => onUnits({
    ...units,
    fractions: v
  });
  const systems = [['metric', 'Metric', 'grams, millilitres, °C'], ['us', 'US customary', 'cups, ounces, °F'], ['uk', 'UK imperial', 'ounces, fl oz, °F']];
  const sampleBySystem = {
    metric: ['200 g flour', '240 ml milk', '60 g butter'],
    us: [fractions ? '1⅔ cups flour' : '1.67 cups flour', '1 cup milk', '4 tbsp butter'],
    uk: ['7 oz flour', '8 fl oz milk', '2 oz butter']
  };
  const tempToken = temp === 'C' ? '175°C' : system === 'uk' ? 'Gas 4' : '350°F';
  const preview = [...sampleBySystem[system], tempToken];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 60
    }
  }, /*#__PURE__*/React.createElement(SubHeader, {
    title: "Units & measurements",
    onClose: onClose
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--r-lg)',
      border: '1px solid color-mix(in srgb, var(--primary) 18%, var(--card))',
      background: 'color-mix(in srgb, var(--primary) 6%, var(--card))',
      padding: '16px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 8
    }
  }, "Preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, preview.map(p => /*#__PURE__*/React.createElement("span", {
    key: p,
    className: "numeric",
    style: {
      fontSize: 14,
      color: 'var(--ink)',
      background: 'var(--card)',
      border: '1px solid var(--line)',
      padding: '6px 11px',
      borderRadius: 'var(--r-pill)',
      whiteSpace: 'nowrap'
    }
  }, p))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 10
    }
  }, "Measurement system"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, systems.map(([id, label, sub], i) => {
    const on = system === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setSystem(id),
      style: {
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        padding: '14px 15px',
        borderRadius: i === 0 ? 'var(--r-md) var(--r-md) 0 0' : i === systems.length - 1 ? '0 0 var(--r-md) var(--r-md)' : 0,
        borderTop: i === 0 ? '1px solid var(--line)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "body-strong",
      style: {
        fontSize: 15
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      className: "caption",
      style: {
        marginTop: 1
      }
    }, sub)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 'var(--r-pill)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: on ? 'none' : '2px solid var(--line-2)',
        background: on ? 'var(--primary)' : 'transparent'
      }
    }, on && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 14,
      color: "var(--on-primary)"
    })));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 10
    }
  }, "Oven temperature"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'var(--paper-3)',
      borderRadius: 'var(--r-sm)',
      padding: 3,
      gap: 3
    }
  }, [['C', 'Celsius'], ['F', 'Fahrenheit']].map(([id, label]) => {
    const on = temp === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setTemp(id),
      style: {
        flex: 1,
        border: 'none',
        cursor: 'pointer',
        borderRadius: 8,
        padding: '9px 0',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 14,
        background: on ? 'var(--card)' : 'transparent',
        color: on ? 'var(--ink)' : 'var(--ink-3)',
        boxShadow: on ? 'var(--shadow-xs)' : 'none'
      }
    }, label);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      padding: '14px 15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      fontSize: 15
    }
  }, "Use fractions"), /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      marginTop: 1
    }
  }, "Show \xBD and \xBC instead of decimals")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFractions(!fractions),
    role: "switch",
    "aria-checked": fractions,
    style: {
      width: 48,
      height: 28,
      borderRadius: 'var(--r-pill)',
      border: 'none',
      cursor: 'pointer',
      background: fractions ? 'var(--primary)' : 'var(--paper-3)',
      position: 'relative',
      flexShrink: 0,
      transition: '.18s'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: fractions ? 23 : 3,
      width: 22,
      height: 22,
      borderRadius: 'var(--r-pill)',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: '.18s'
    }
  })))));
}
function HelpScreen({
  onClose
}) {
  const [open, setOpen] = React.useState(0);
  const [delOpen, setDelOpen] = React.useState(false);
  const [unitsOpen, setUnitsOpen] = React.useState(false);
  const topics = [['sparkles', 'Getting started', 'Set up your cookbook, choose an accent color, and add your first recipe in under a minute.', window.__resources && window.__resources.helpGettingStarted || 'help/getting-started.png'], ['camera', 'Scanning a recipe', 'Point your camera at any printed recipe — we read the title, ingredients and steps so you can tweak and save.', window.__resources && window.__resources.helpScanning || 'help/scanning.png'], ['globe', 'Saving recipes from the web', 'Found something you love online? Save it straight to your cookbook with one tap once saving is unlocked.', window.__resources && window.__resources.helpWebSave || 'help/web-save.png'], ['book-open', 'Organising your cookbook', 'Use categories, sorting and search to keep every recipe easy to find.', window.__resources && window.__resources.helpCookbookGrid || 'help/cookbook-grid.png'], ['credit-card', 'Purchases & restore', 'Manage one-time unlocks like ad removal and web saving — and restore them on a new device.', window.__resources && window.__resources.helpPurchases || 'help/purchases.png']];
  const contact = [['mail', 'Email support', 'We reply within a day'], ['message-circle', 'Send feedback', 'Tell us what to cook up next'], ['star', 'Rate Crave Crafted', 'Leave a review on the App Store']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 60
    }
  }, /*#__PURE__*/React.createElement(SubHeader, {
    title: "Help & feedback",
    onClose: onClose
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--card)',
      border: '1.5px solid var(--line-2)',
      borderRadius: 'var(--r-sm)',
      padding: '13px 15px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 19,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      color: 'var(--ink-3)'
    }
  }, "Search help articles"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 10
    }
  }, "Popular topics"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden'
    }
  }, topics.map(([ic, l, desc, img], i) => {
    const isOpen = open === i;
    return /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        borderTop: i === 0 ? 'none' : '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? null : i),
      "aria-expanded": isOpen,
      style: {
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'transparent',
        border: 'none',
        padding: '14px 15px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 18,
      color: "var(--primary)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        fontWeight: 500,
        color: 'var(--ink)'
      }
    }, l), /*#__PURE__*/React.createElement(Icon, {
      name: isOpen ? 'chevron-down' : 'chevron-right',
      size: 18,
      color: "var(--ink-3)"
    })), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 16px 16px 47px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "small",
      style: {
        margin: '0 0 12px',
        lineHeight: 1.5
      }
    }, desc), /*#__PURE__*/React.createElement("img", {
      src: img,
      alt: l,
      style: {
        display: 'block',
        width: '100%',
        borderRadius: 'var(--r-sm)',
        border: '1px solid var(--line)'
      }
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDelOpen(!delOpen),
    "aria-expanded": delOpen,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'transparent',
      border: 'none',
      padding: '14px 15px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 18,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, "How to delete recipes"), /*#__PURE__*/React.createElement(Icon, {
    name: delOpen ? 'chevron-down' : 'chevron-right',
    size: 18,
    color: "var(--ink-3)"
  })), delOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px 47px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '0 0 13px',
      lineHeight: 1.5
    }
  }, "Removed a recipe by mistake? Deleting is always confirmed first, so you won't lose anything by tapping around."), [['hand', 'Press & hold a recipe card', 'On the Cookbook tab, touch and hold any recipe for a moment to open its quick menu.'], ['list', 'Choose Delete recipe', 'Tap Delete recipe in the menu — or open a recipe, tap the pencil to edit, and scroll to Delete.'], ['check-circle', 'Confirm', 'Confirm in the dialog and the recipe leaves your cookbook right away.']].map(([ic, title, body], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      paddingTop: i === 0 ? 0 : 12,
      marginTop: i === 0 ? 0 : 12,
      borderTop: i === 0 ? 'none' : '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 26,
      height: 26,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 14,
    color: "var(--primary-press)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      fontSize: 14
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '2px 0 0',
      lineHeight: 1.45,
      color: 'var(--ink-2)'
    }
  }, body)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setUnitsOpen(!unitsOpen),
    "aria-expanded": unitsOpen,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'transparent',
      border: 'none',
      padding: '14px 15px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ruler",
    size: 18,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, "Units & measurements"), /*#__PURE__*/React.createElement(Icon, {
    name: unitsOpen ? 'chevron-down' : 'chevron-right',
    size: 18,
    color: "var(--ink-3)"
  })), unitsOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px 47px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '0 0 13px',
      lineHeight: 1.5
    }
  }, "Set your preferred units once and every recipe shows them \u2014 your choice is saved and used across the whole app."), [['settings', 'Open from your profile', 'Go to your profile and tap Units & measurements to set your preferences.'], ['scale', 'Pick a measurement system', 'Choose Metric, US customary, or UK imperial — amounts convert automatically (g ↔ oz/lb, ml ↔ fl oz).'], ['thermometer', 'Temperature & fractions', 'Switch oven temps between °C and °F, and show amounts as neat fractions (1½ tsp) or decimals (1.5 tsp).']].map(([ic, title, body], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      paddingTop: i === 0 ? 0 : 12,
      marginTop: i === 0 ? 0 : 12,
      borderTop: i === 0 ? 'none' : '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 26,
      height: 26,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 14,
    color: "var(--primary-press)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      fontSize: 14
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '2px 0 0',
      lineHeight: 1.45,
      color: 'var(--ink-2)'
    }
  }, body)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 10
    }
  }, "Get in touch"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, contact.map(([ic, title, sub]) => /*#__PURE__*/React.createElement("button", {
    key: title,
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      padding: '14px 15px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--r-pill)',
      background: 'color-mix(in srgb, var(--primary) 14%, var(--card))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 18,
    color: "var(--primary)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      fontSize: 15
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      marginTop: 1
    }
  }, sub)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--ink-3)"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 20px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.markSvg || "../../assets/mark.svg",
    alt: "Crave Crafted",
    style: {
      width: 38,
      height: 38,
      opacity: 0.9
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 17,
      color: 'var(--ink-2)'
    }
  }, "Crave ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic'
    }
  }, "Crafted")), /*#__PURE__*/React.createElement("span", {
    className: "caption"
  }, "Version 1.4.2"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--primary)'
    }
  }, "Terms"), /*#__PURE__*/React.createElement("span", {
    className: "caption"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--primary)'
    }
  }, "Privacy"))));
}
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Paprika",
  "userName": "Maya",
  "cookbookName": "Maya's Cookbook",
  "theme": "light"
} /*EDITMODE-END*/;

// Warm dark palette — cozy charcoal-brown, never pure black.
// Cards sit a clear step above --paper so they read as raised surfaces.
const DARK_VARS = {
  '--paper': '#1C1813',
  '--paper-2': '#241E18',
  '--paper-3': '#3A3128',
  '--card': '#352D24',
  '--card-contrast': '#3E342A',
  '--ink': '#F4EBDD',
  '--ink-2': '#CBBCAA',
  '--ink-3': '#A89A88',
  '--line': '#473D32',
  '--line-2': '#564A3D',
  '--shadow-xs': '0 1px 2px rgba(0,0,0,0.4)',
  '--shadow-sm': '0 1px 3px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.32)',
  '--shadow-md': '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.32)',
  '--shadow-lg': '0 12px 28px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.38)',
  '--shadow-xl': '0 24px 48px rgba(0,0,0,0.6)'
};
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('library');
  const [detail, setDetail] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [sharing, setSharing] = React.useState(null);
  const [cardMenu, setCardMenu] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [scan, setScan] = React.useState(false);
  const [savedIds, setSavedIds] = React.useState(window.RECIPES.map(r => r.id));
  const [toast, setToast] = React.useState('');
  const [plus, setPlus] = React.useState(false); // legacy combined flag (unused)
  const [adFree, setAdFree] = React.useState(false); // IAP: remove ads
  const [canSave, setCanSave] = React.useState(false); // IAP: save web recipes
  const [units, setUnits] = React.useState(() => {
    const def = {
      system: 'metric',
      temp: 'C',
      fractions: true
    };
    try {
      return {
        ...def,
        ...(JSON.parse(localStorage.getItem('cc-units-prefs')) || {})
      };
    } catch (e) {
      return def;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem('cc-units-prefs', JSON.stringify(units));
    } catch (e) {}
  }, [units]);
  const toastT = React.useRef(null);

  // accent is driven by the tweak so the in-app "You" picker and the Tweaks
  // panel stay in sync (one source of truth)
  const accent = ACCENTS[t.accent] ? t.accent : 'Paprika';
  const theme = t.theme === 'dark' ? 'dark' : 'light';
  const isDark = theme === 'dark';
  const flash = msg => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(''), 1900);
  };
  const save = r => {
    if (!savedIds.includes(r.id)) setSavedIds([...savedIds, r.id]);
    flash(`Saved “${r.title}”`);
  };
  const addRecipe = recipe => {
    const r = {
      id: 'new-' + Date.now(),
      rating: null,
      grad: window.GRADS ? window.GRADS.tomato : undefined,
      ...recipe
    };
    window.RECIPES.unshift(r);
    setSavedIds(ids => [...ids, r.id]);
    setScan(false);
    setTab('library');
    flash(`Added “${r.title}”`);
  };
  const pickAccent = name => {
    setTweak('accent', name);
    flash(`${name} accent applied`);
  };
  const pickTheme = v => {
    setTweak('theme', v);
  };
  const saveEdit = fields => {
    const i = window.RECIPES.findIndex(x => x.id === editing.id);
    const updated = {
      ...editing,
      ...fields,
      blurb: fields.blurb || editing.blurb,
      servings: editing.servings,
      id: editing.id,
      grad: editing.grad,
      rating: editing.rating,
      source: editing.source
    };
    if (i !== -1) window.RECIPES[i] = updated;
    setDetail(d => d && d.id === updated.id ? updated : d);
    setEditing(null);
    flash(`Updated “${updated.title}”`);
  };
  const deleteRecipe = id => {
    const i = window.RECIPES.findIndex(x => x.id === id);
    if (i !== -1) window.RECIPES.splice(i, 1);
    setSavedIds(ids => ids.filter(x => x !== id));
    setEditing(null);
    setDetail(null);
    setTab('library');
    flash('Recipe deleted');
  };
  const subscribe = () => {
    setPlus(true);
    flash('Plus unlocked — ads off, saving on');
  };
  const buyAdFree = () => {
    setAdFree(true);
    flash('Ads removed — enjoy!');
  };
  const buySaving = () => {
    setCanSave(true);
    flash('Web recipe saving unlocked');
  };
  const buyBundle = () => {
    setAdFree(true);
    setCanSave(true);
    flash('Bundle unlocked — ads off, saving on');
  };
  const goUpgrade = () => {
    setTab('you');
    flash('Unlock saving to save this recipe');
  };
  const a = ACCENTS[accent];
  const accentVars = {
    '--primary': a.primary,
    '--primary-hover': a.hover,
    '--primary-press': a.press,
    '--primary-soft': a.soft,
    '--primary-softer': a.softer
  };
  const themeVars = isDark ? DARK_VARS : {};
  const accentNames = Object.keys(ACCENTS);
  const profileInitial = (t.userName || 'M').trim()[0].toUpperCase();
  let screen,
    showTabs = true;
  if (detail) {
    const isWeb = !!detail.site;
    screen = /*#__PURE__*/React.createElement(DetailScreen, {
      key: detail.id,
      r: detail,
      onBack: () => setDetail(null),
      onSave: save,
      onEdit: r => setEditing(r),
      onShare: r => setSharing(r),
      web: isWeb,
      saved: savedIds.includes(detail.id),
      canSave: canSave,
      units: units,
      onSaveWeb: r => {
        if (canSave) {
          save(r);
        } else {
          setDetail(null);
          goUpgrade();
        }
      },
      onOpenSource: r => flash(`Opening ${r.site}\u2026`),
      adFree: adFree,
      onUpgrade: () => {
        setDetail(null);
        goUpgrade();
      }
    });
    showTabs = false;
  } else if (tab === 'library') screen = /*#__PURE__*/React.createElement(LibraryScreen, {
    onOpen: setDetail,
    onSearch: () => setTab('discover'),
    onSave: save,
    onLongPress: r => setCardMenu(r),
    onProfile: () => setTab('you'),
    userName: t.userName || 'there',
    cookbookName: t.cookbookName || 'My Cookbook'
  });else if (tab === 'discover') screen = /*#__PURE__*/React.createElement(DiscoverScreen, {
    onSave: save,
    savedIds: savedIds,
    onOpen: setDetail,
    onProfile: () => setTab('you'),
    initial: profileInitial,
    adFree: adFree,
    canSave: canSave,
    onUpgrade: goUpgrade
  });else if (tab === 'units') {
    screen = /*#__PURE__*/React.createElement(UnitsScreen, {
      onClose: () => setTab('you'),
      units: units,
      onUnits: setUnits
    });
    showTabs = false;
  } else if (tab === 'help') {
    screen = /*#__PURE__*/React.createElement(HelpScreen, {
      onClose: () => setTab('you')
    });
    showTabs = false;
  } else {
    screen = /*#__PURE__*/React.createElement(YouScreen, {
      accent: accent,
      onAccent: pickAccent,
      onClose: () => setTab('library'),
      userName: t.userName,
      onUserName: v => setTweak('userName', v),
      cookbookName: t.cookbookName || 'My Cookbook',
      onCookbookName: v => setTweak('cookbookName', v),
      theme: theme,
      onTheme: pickTheme,
      adFree: adFree,
      canSave: canSave,
      onBuyAdFree: buyAdFree,
      onBuySaving: buySaving,
      onBuyBundle: buyBundle,
      onOpenSetting: route => setTab(route)
    });
    showTabs = false;
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...accentVars,
      ...themeVars
    }
  }, /*#__PURE__*/React.createElement(IOSDevice, {
    dark: isDark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      minHeight: '100%',
      position: 'relative',
      paddingTop: 54
    }
  }, screen), showTabs && /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    onTab: t2 => {
      setDetail(null);
      setTab(t2);
    },
    onScan: () => setScan(true)
  }), /*#__PURE__*/React.createElement(Toast, {
    msg: toast
  }), scan && /*#__PURE__*/React.createElement(ScanScreen, {
    onClose: () => setScan(false),
    onSubmit: addRecipe
  }), editing && /*#__PURE__*/React.createElement(RecipeForm, {
    initial: editing,
    editing: true,
    onCancel: () => setEditing(null),
    onSubmit: saveEdit,
    onDelete: deleteRecipe
  }), sharing && /*#__PURE__*/React.createElement(ShareSheet, {
    r: sharing,
    onClose: () => setSharing(null)
  }), cardMenu && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 97,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setCardMenu(null),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(28,24,19,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: '0 10px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '15px 18px 13px',
      textAlign: 'center',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      fontSize: 12
    }
  }, "Recipe"), /*#__PURE__*/React.createElement("div", {
    className: "body-strong",
    style: {
      marginTop: 2,
      fontSize: 15
    }
  }, cardMenu.title)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const r = cardMenu;
      setCardMenu(null);
      setEditing(r);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      border: 'none',
      background: 'transparent',
      padding: '15px 18px',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 16,
      color: 'var(--ink)',
      textAlign: 'left',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 19,
    color: "var(--primary)"
  }), "Edit recipe"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setConfirmDelete(cardMenu);
      setCardMenu(null);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      border: 'none',
      background: 'transparent',
      padding: '15px 18px',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 16,
      color: 'var(--danger)',
      textAlign: 'left',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 19,
    color: "var(--danger)"
  }), "Delete recipe")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCardMenu(null),
    style: {
      background: 'var(--card)',
      border: 'none',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-xl)',
      padding: '15px 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--ink)'
    }
  }, "Cancel"))), confirmDelete && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'rgba(28,24,19,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 300,
      background: 'var(--paper)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 22px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 19,
      color: 'var(--ink)'
    }
  }, "Delete recipe?"), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '8px 0 0'
    }
  }, "\u201C", confirmDelete.title, "\u201D will be removed from your cookbook. This can\u2019t be undone.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDelete(null),
    style: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      padding: '14px 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 16,
      color: 'var(--ink-2)',
      borderRight: '1px solid var(--line)'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const r = confirmDelete;
      setConfirmDelete(null);
      deleteRecipe(r.id);
    },
    style: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      padding: '14px 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--danger)'
    }
  }, "Delete"))))), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Appearance"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Theme",
    value: theme,
    options: ['light', 'dark'],
    onChange: pickTheme
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Personalization"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Accent",
    value: a.primary,
    options: accentNames.map(n => ACCENTS[n].primary),
    onChange: hex => {
      const name = accentNames.find(n => ACCENTS[n].primary === hex) || 'Paprika';
      setTweak('accent', name);
    }
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Greeting name",
    value: t.userName,
    onChange: v => setTweak('userName', v)
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Cookbook name",
    value: t.cookbookName,
    onChange: v => setTweak('cookbookName', v)
  })));
}
Object.assign(window, {
  App,
  YouScreen,
  ACCENTS
});
if (!window.__NO_AUTO_MOUNT) {
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Detail.jsx
try { (() => {
// Detail.jsx — recipe detail: photo header, meta, servings, ingredients/steps tabs

function DetailScreen({
  r,
  onBack,
  onSave,
  onEdit,
  onShare,
  web = false,
  saved = false,
  canSave = false,
  onSaveWeb,
  onOpenSource,
  adFree = false,
  onUpgrade,
  units
}) {
  const u = units || {
    system: 'metric',
    temp: 'C',
    fractions: true
  };
  const [tab, setTab] = React.useState('ingredients');
  const [servings, setServings] = React.useState(r.servings);
  const [checked, setChecked] = React.useState({});
  const [menuFor, setMenuFor] = React.useState(null);
  // per-ingredient unit overrides, persisted per recipe
  const unitKey = 'cc-ing-units-' + r.id;
  const [ingUnits, setIngUnits] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(unitKey)) || {};
    } catch (e) {
      return {};
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(unitKey, JSON.stringify(ingUnits));
    } catch (e) {}
  }, [ingUnits, unitKey]);
  const ratio = servings / r.servings;
  const c = window.catStyle(r.cat);
  const headerBg = web ? r.grad : c.fg;
  const scale = amt => window.CCUnits.convertAmount(amt, ratio, u);
  const showTemp = t => window.CCUnits.convertTemp(t, u);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 48,
      marginTop: -54
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: headerBg,
      position: 'relative',
      paddingTop: 112,
      paddingBottom: 44
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(130% 80% at 80% 0%, rgba(255,255,255,0.18), rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.18) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 56,
      left: 20,
      right: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 0'
    }
  }, /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "arrow-left",
    light: true,
    onClick: onBack,
    size: 40,
    testId: "back"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "share",
    light: true,
    size: 40,
    onClick: () => onShare && onShare(r),
    testId: "share"
  }), web ? /*#__PURE__*/React.createElement(RoundBtn, {
    icon: saved ? 'check' : canSave ? 'bookmark-plus' : 'lock',
    light: true,
    size: 40,
    onClick: () => !saved && onSaveWeb && onSaveWeb(r),
    testId: "websave"
  }) : /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "pencil",
    light: true,
    size: 40,
    onClick: () => onEdit && onEdit(r),
    testId: "edit"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      paddingLeft: 20,
      paddingRight: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: '#fff',
      background: 'rgba(255,255,255,0.22)',
      padding: '4px 10px',
      borderRadius: 'var(--r-xs)'
    }
  }, r.cat), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 32,
      lineHeight: 1.1,
      letterSpacing: '-.02em',
      color: '#fff',
      marginTop: 12,
      textShadow: '0 2px 16px rgba(0,0,0,0.22)'
    }
  }, r.title), web && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      marginTop: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      fontWeight: 600,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "globe",
    size: 14,
    color: "#fff"
  }), r.site), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.55)'
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      fontWeight: 600,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 13,
    color: "#fff",
    fill: true
  }), r.rating)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: '24px 24px 0 0',
      marginTop: -22,
      position: 'relative',
      padding: '22px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, [['clock', `${r.time} min`, 'Total'], ['thermometer', showTemp(r.temp), 'Cook temp'], ['users', servings, 'Servings']].map(([ic, v, l], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      padding: '12px 10px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 18,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--ink)',
      marginTop: 4
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      fontSize: 11
    }
  }, l)))), web && r.blurb && /*#__PURE__*/React.createElement("p", {
    className: "body",
    style: {
      margin: '16px 0 0',
      color: 'var(--ink-2)'
    }
  }, r.blurb), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      marginTop: 22,
      borderBottom: '1px solid var(--line)'
    }
  }, [['ingredients', 'Ingredients'], ['steps', 'Instructions']].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setTab(k),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 15,
      padding: '0 0 11px',
      color: tab === k ? 'var(--ink)' : 'var(--ink-3)',
      borderBottom: tab === k ? '2.5px solid var(--primary)' : '2.5px solid transparent',
      marginBottom: -1
    }
  }, l))), tab === 'ingredients' ? /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--paper-3)',
      borderRadius: 'var(--r-md)',
      padding: '10px 14px',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "body-strong"
  }, "Servings"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "minus",
    light: true,
    size: 32,
    onClick: () => setServings(Math.max(1, servings - 1))
  }), /*#__PURE__*/React.createElement("span", {
    className: "numeric",
    style: {
      fontSize: 17,
      minWidth: 18,
      textAlign: 'center'
    }
  }, servings), /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "plus",
    light: true,
    size: 32,
    onClick: () => setServings(servings + 1)
  }))), !adFree && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(AdBanner, {
    onUpgrade: onUpgrade
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, r.ingredients.map(([name, amt], i) => {
    const on = checked[i];
    const options = window.CCUnits.unitOptions(amt, ratio, u);
    const override = ingUnits[i];
    const effUnit = override || window.CCUnits.displayUnit(amt, ratio, u);
    const display = override ? window.CCUnits.amountInUnit(amt, ratio, override, u) : scale(amt);
    const open = menuFor === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setChecked({
        ...checked,
        [i]: !on
      }),
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background: 'transparent',
        border: 'none',
        padding: '13px 4px 13px 15px',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 'var(--r-pill)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: on ? 'none' : '2px solid var(--line-2)',
        background: on ? 'var(--primary)' : 'transparent'
      }
    }, on && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 14,
      color: "#fff"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        fontWeight: 500,
        color: on ? 'var(--ink-3)' : 'var(--ink)',
        textDecoration: on ? 'line-through' : 'none'
      }
    }, name)), options ? /*#__PURE__*/React.createElement("button", {
      onClick: () => setMenuFor(open ? null : i),
      "aria-label": `Change unit for ${name}`,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: open ? 'var(--primary-soft)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--r-pill)',
        padding: '7px 11px',
        margin: '0 8px 0 0',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "numeric",
      style: {
        fontSize: 13.5,
        color: open ? 'var(--primary-press)' : 'var(--ink-2)'
      }
    }, display), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 14,
      color: open ? 'var(--primary-press)' : 'var(--ink-3)',
      style: {
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform .18s'
      }
    })) : /*#__PURE__*/React.createElement("span", {
      className: "numeric",
      style: {
        fontSize: 13.5,
        color: 'var(--ink-2)',
        whiteSpace: 'nowrap',
        padding: '0 15px 0 8px'
      }
    }, display), options && open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: () => setMenuFor(null),
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 40
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 'calc(100% + 6px)',
        right: 8,
        zIndex: 41,
        minWidth: 156,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: 6,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "caption",
      style: {
        fontSize: 10.5,
        padding: '4px 10px 6px'
      }
    }, "Show this amount in"), options.map(o => {
      const sel = o.unit === effUnit;
      return /*#__PURE__*/React.createElement("button", {
        key: o.unit,
        onClick: () => {
          const next = {
            ...ingUnits
          };
          next[i] = o.unit;
          setIngUnits(next);
          setMenuFor(null);
        },
        style: {
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: sel ? 'var(--primary-soft)' : 'transparent',
          border: 'none',
          borderRadius: 'var(--r-sm)',
          padding: '9px 10px',
          cursor: 'pointer',
          textAlign: 'left'
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "numeric",
        style: {
          fontSize: 13.5,
          color: sel ? 'var(--primary-press)' : 'var(--ink)'
        }
      }, o.value), sel && /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 15,
        color: "var(--primary-press)"
      }));
    }))));
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, !adFree && /*#__PURE__*/React.createElement(AdBanner, {
    onUpgrade: onUpgrade
  }), r.steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 30,
      height: 30,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary-soft)',
      color: 'var(--primary-press)',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, i + 1), /*#__PURE__*/React.createElement("p", {
    className: "body",
    style: {
      margin: 0,
      paddingTop: 3,
      color: 'var(--ink)'
    }
  }, showTemp(s))))), web && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, saved ? /*#__PURE__*/React.createElement(Btn, {
    kind: "secondary",
    full: true,
    icon: "check"
  }, "Saved to your cookbook") : /*#__PURE__*/React.createElement(Btn, {
    kind: "primary",
    full: true,
    icon: canSave ? 'bookmark-plus' : 'lock',
    onClick: () => onSaveWeb && onSaveWeb(r)
  }, canSave ? 'Save to cookbook' : 'Unlock saving to add this'), /*#__PURE__*/React.createElement(Btn, {
    kind: "ghost",
    full: true,
    icon: "external-link",
    onClick: () => onOpenSource && onOpenSource(r)
  }, "View on ", r.site))));
}
Object.assign(window, {
  DetailScreen
});

// ── Share sheet — a clean, high-contrast recipe card to send to someone ──
function ShareSheet({
  r,
  onClose,
  units
}) {
  const u = units || {
    system: 'metric',
    temp: 'C',
    fractions: true
  };
  const c = window.catStyle(r.cat);
  const sendTargets = [['message-circle', 'Messages'], ['mail', 'Mail'], ['link', 'Copy link'], ['download', 'Save image']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 96,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(28,24,19,0.55)',
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--paper)',
      borderRadius: '26px 26px 0 0',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '90%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 0 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 5,
      borderRadius: 'var(--r-pill)',
      background: 'var(--line-2)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "overline"
  }, "Share recipe"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--r-pill)',
      border: 'none',
      background: 'var(--paper-3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 19,
    color: "var(--ink-2)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '0 18px 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--r-lg)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: c.fg,
      padding: '20px 22px 18px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(130% 90% at 82% 0%, rgba(255,255,255,0.16), rgba(0,0,0,0) 60%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: '#fff',
      background: 'rgba(255,255,255,0.22)',
      padding: '4px 10px',
      borderRadius: 'var(--r-xs)'
    }
  }, r.cat), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontStyle: 'italic',
      fontSize: 15,
      color: 'rgba(255,255,255,0.92)'
    }
  }, "Crave Crafted")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 27,
      lineHeight: 1.12,
      letterSpacing: '-.02em',
      color: '#fff',
      marginTop: 14,
      textShadow: '0 2px 14px rgba(0,0,0,0.2)'
    }
  }, r.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderBottom: '1px solid var(--line)'
    }
  }, [['clock', `${r.time} min`, 'Total'], ['thermometer', window.CCUnits.convertTemp(r.temp, u), 'Cook temp'], ['users', r.servings, 'Servings']].map(([ic, v, l], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      padding: '14px 6px',
      borderRight: i < 2 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 17,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--ink)',
      marginTop: 4
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    className: "caption",
    style: {
      fontSize: 10.5
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      marginBottom: 11
    }
  }, "Ingredients"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, r.ingredients.map(([name, amt], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
      borderBottom: i < r.ingredients.length - 1 ? '1px dashed var(--line)' : 'none',
      paddingBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    className: "numeric",
    style: {
      fontSize: 13.5,
      color: 'var(--ink-2)',
      whiteSpace: 'nowrap'
    }
  }, window.CCUnits.convertAmount(amt, 1, u))))), /*#__PURE__*/React.createElement("div", {
    className: "overline",
    style: {
      margin: '22px 0 13px'
    }
  }, "Instructions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 15
    }
  }, r.steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 26,
      height: 26,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary-soft)',
      color: 'var(--primary-press)',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, i + 1), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      paddingTop: 2,
      fontFamily: 'var(--font-sans)',
      fontSize: 14.5,
      lineHeight: 1.5,
      color: 'var(--ink)'
    }
  }, window.CCUnits.convertTemp(s, u)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--line)',
      padding: '14px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      background: 'var(--paper-2)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.markSvg || "../../assets/mark.svg",
    alt: "",
    style: {
      width: 22,
      height: 22,
      opacity: 0.9
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--ink-3)'
    }
  }, "Made with Crave Crafted")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: '16px 18px 34px',
      borderTop: '1px solid var(--line)'
    }
  }, sendTargets.map(([ic, l]) => /*#__PURE__*/React.createElement("button", {
    key: l,
    onClick: onClose,
    style: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 'var(--r-md)',
      background: 'var(--card)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-xs)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 22,
    color: "var(--primary)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11.5,
      fontWeight: 600,
      color: 'var(--ink-2)'
    }
  }, l))))));
}
Object.assign(window, {
  ShareSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Detail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Discover.jsx
try { (() => {
// Discover.jsx — search the web & recipe APIs; save results to your library

function DiscoverScreen({
  onSave,
  savedIds,
  onOpen,
  onProfile,
  initial = 'M',
  adFree = false,
  canSave = false,
  onUpgrade
}) {
  const [q, setQ] = React.useState('weeknight');
  const [filter, setFilter] = React.useState(null);
  const suggestions = ['Under 45 min', 'Vegetarian', 'One pot', 'High protein', 'Budget'];
  const results = window.DISCOVER.filter(r => !filter || (r.tags || []).includes(filter));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 130
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 20px 0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "h2",
    style: {
      fontSize: 27
    }
  }, "Discover"), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '4px 0 0'
    }
  }, "Search across the web.")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    onClick: onProfile,
    letter: initial
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--card)',
      border: '1.5px solid var(--primary)',
      borderRadius: 'var(--r-sm)',
      padding: '13px 15px',
      boxShadow: '0 0 0 3px var(--primary-soft)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 19,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      color: 'var(--ink)'
    }
  }, q), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 2,
      height: 18,
      background: 'var(--primary)',
      animation: 'blink 1.1s steps(1) infinite'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18,
    color: "var(--ink-3)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '14px 20px 0',
      scrollbarWidth: 'none'
    }
  }, suggestions.map(s => /*#__PURE__*/React.createElement(Chip, {
    key: s,
    active: filter === s,
    onClick: () => setFilter(filter === s ? null : s)
  }, s))), !adFree && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 0'
    }
  }, /*#__PURE__*/React.createElement(AdBanner, {
    onUpgrade: onUpgrade
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "overline"
  }, "Results from the web"), !canSave && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 11.5,
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 12,
    color: "var(--ink-3)"
  }), "Saving is a paid unlock")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, results.map(r => {
    const saved = savedIds.includes(r.id);
    const locked = !canSave && !saved;
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        padding: '14px 15px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onOpen && onOpen(r),
      "data-test": "discovercard",
      style: {
        flex: 1,
        minWidth: 0,
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "recipe-title",
      style: {
        fontSize: 17,
        lineHeight: 1.2
      }
    }, r.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--info)',
        background: 'var(--info-soft)',
        padding: '3px 8px',
        borderRadius: 'var(--r-xs)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "globe",
      size: 12
    }), r.site), /*#__PURE__*/React.createElement(Meta, {
      time: r.time,
      rating: r.rating
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (locked) {
          onUpgrade && onUpgrade();
        } else if (!saved) {
          onSave(r);
        }
      },
      disabled: saved,
      "aria-label": locked ? 'Unlock saving' : saved ? 'Saved' : 'Save to cookbook',
      style: {
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: 'var(--r-pill)',
        border: locked ? '1.5px solid var(--line-2)' : 'none',
        cursor: saved ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: saved ? 'var(--accent-soft)' : locked ? 'var(--paper-3)' : 'var(--primary)',
        color: saved ? 'var(--accent-hover)' : locked ? 'var(--ink-3)' : 'var(--on-primary)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: saved ? 'check' : locked ? 'lock' : 'plus',
      size: saved || !locked ? 20 : 17
    })));
  }))));
}
Object.assign(window, {
  DiscoverScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Discover.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Library.jsx
try { (() => {
// Library.jsx — home screen: greeting, search, sort, filter chips, recipe grid

function LibraryHeader({
  onProfile,
  initial = 'M'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.markSvg || "../../assets/mark.svg",
    alt: "Crave Crafted",
    style: {
      width: 34,
      height: 34
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 22,
      letterSpacing: '-.02em',
      color: 'var(--ink)',
      whiteSpace: 'nowrap'
    }
  }, "Crave ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic',
      color: 'var(--primary)'
    }
  }, "Crafted"))), /*#__PURE__*/React.createElement(Avatar, {
    onClick: onProfile,
    initial: initial,
    letter: initial
  }));
}
function SortMenu({
  sort,
  onSort,
  open,
  setOpen
}) {
  const opts = [['recent', 'Recently added'], ['time', 'Quickest first'], ['az', 'A–Z']];
  const label = opts.find(o => o[0] === sort)[1];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap',
      border: '1.5px solid var(--line-2)',
      background: 'var(--card)',
      color: 'var(--ink-2)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 13.5,
      padding: '8px 13px',
      borderRadius: 'var(--r-pill)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-down",
    size: 15
  }), label), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 44,
      right: 0,
      zIndex: 30,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--shadow-lg)',
      padding: 6,
      width: 180
    }
  }, opts.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => {
      onSort(k);
      setOpen(false);
    },
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: 'none',
      background: k === sort ? 'var(--primary-softer)' : 'transparent',
      color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14.5,
      fontWeight: 500,
      padding: '10px 11px',
      borderRadius: 'var(--r-sm)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, l, k === sort && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    color: "var(--primary)"
  })))));
}
function ViewToggle({
  view,
  onView
}) {
  const opt = (id, icon) => /*#__PURE__*/React.createElement("button", {
    onClick: () => onView(id),
    "aria-label": id + ' view',
    style: {
      width: 34,
      height: 30,
      border: 'none',
      cursor: 'pointer',
      borderRadius: 7,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: view === id ? 'var(--card)' : 'transparent',
      color: view === id ? 'var(--primary)' : 'var(--ink-3)',
      boxShadow: view === id ? 'var(--shadow-xs)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      background: 'var(--paper-3)',
      borderRadius: 'var(--r-sm)',
      padding: 3,
      gap: 2
    }
  }, opt('grid', 'layout-grid'), opt('list', 'list'));
}
function LibraryScreen({
  onOpen,
  onSearch,
  onSave,
  onLongPress,
  onProfile,
  userName = 'Maya',
  cookbookName = 'My Cookbook'
}) {
  const [filter, setFilter] = React.useState('All');
  const [sort, setSort] = React.useState('recent');
  const [view, setView] = React.useState('grid');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const filters = ['All', 'Dinner', 'Breakfast', 'Vegetarian', 'Dessert'];
  const q = query.trim().toLowerCase();
  let list = window.RECIPES.filter(r => (filter === 'All' || r.cat === filter) && (!q || r.title.toLowerCase().includes(q) || (r.ingredients || []).some(([name]) => name.toLowerCase().includes(q))));
  list = [...list].sort((a, b) => {
    if (sort === 'time') return a.time - b.time;
    if (sort === 'az') return a.title.localeCompare(b.title);
    return 0;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 130
    },
    onClick: () => menuOpen && setMenuOpen(false)
  }, /*#__PURE__*/React.createElement(LibraryHeader, {
    onProfile: onProfile,
    initial: (userName || 'M').trim()[0].toUpperCase()
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h2",
    style: {
      fontSize: 25,
      lineHeight: 1.1
    }
  }, cookbookName)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '18px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--card)',
      border: '1.5px solid var(--line-2)',
      borderRadius: 'var(--r-sm)',
      padding: '11px 14px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 19,
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search your cookbook",
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      color: 'var(--ink)'
    }
  }), query && /*#__PURE__*/React.createElement("button", {
    onClick: () => setQuery(''),
    "aria-label": "Clear search",
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 17,
    color: "var(--ink-3)"
  }))), /*#__PURE__*/React.createElement(ViewToggle, {
    view: view,
    onView: setView
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)',
      margin: '14px 20px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px 0',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      flex: 1,
      paddingBottom: 2,
      scrollbarWidth: 'none'
    }
  }, filters.map(f => /*#__PURE__*/React.createElement(Chip, {
    key: f,
    active: filter === f,
    onClick: () => setFilter(f)
  }, f)))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)',
      margin: '10px 20px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px 0',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "caption",
    style: {
      fontSize: 13,
      whiteSpace: 'nowrap'
    }
  }, list.length, " recipes"), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement(SortMenu, {
    sort: sort,
    onSort: setSort,
    open: menuOpen,
    setOpen: setMenuOpen
  }))), list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '44px 30px 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search-x",
    size: 30,
    color: "var(--ink-3)"
  }), /*#__PURE__*/React.createElement("p", {
    className: "body",
    style: {
      margin: '14px 0 0',
      color: 'var(--ink-2)'
    }
  }, "No recipes in your cookbook match ", q ? `“${query}”` : 'that filter', "."), onSearch && /*#__PURE__*/React.createElement("button", {
    onClick: onSearch,
    style: {
      marginTop: 16,
      border: 'none',
      background: 'var(--primary-soft)',
      color: 'var(--primary-press)',
      borderRadius: 'var(--r-pill)',
      padding: '10px 18px',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 14,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "globe",
    size: 15,
    color: "var(--primary-press)"
  }), "Search the web instead")) : view === 'grid' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      padding: '14px 20px 0'
    }
  }, list.map(r => /*#__PURE__*/React.createElement(RecipeCard, {
    key: r.id,
    r: r,
    view: "grid",
    onClick: () => onOpen(r),
    onSave: () => onSave(r),
    onLongPress: onLongPress
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '14px 20px 0'
    }
  }, list.map(r => /*#__PURE__*/React.createElement(RecipeCard, {
    key: r.id,
    r: r,
    view: "list",
    onClick: () => onOpen(r),
    onSave: () => onSave(r),
    onLongPress: onLongPress
  }))));
}
Object.assign(window, {
  LibraryScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Library.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Scan.jsx
try { (() => {
// Scan.jsx — capture flow: aim → scanning → edit (editable form) + manual entry

function FauxPage() {
  const line = (w, strong) => /*#__PURE__*/React.createElement("div", {
    style: {
      height: strong ? 9 : 6,
      width: w,
      borderRadius: 3,
      background: strong ? '#C9BCA8' : '#E0D5C2'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 220,
      background: '#FBF5EA',
      borderRadius: 10,
      padding: '22px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 17,
      color: '#7A6A55',
      fontStyle: 'italic'
    }
  }, "Nonna's rag\xF9"), line('100%', true), line('92%'), line('96%'), line('70%'), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6
    }
  }), line('60%', true), line('88%'), line('94%'), line('52%'));
}

// ── Editable recipe form (used for scanned + manual entry) ─────
const FORM_CATS = ['Dinner', 'Breakfast', 'Lunch', 'Vegetarian', 'Dessert', 'Snack'];
function RecipeForm({
  initial,
  scanned = false,
  editing = false,
  onCancel,
  onSubmit,
  onDelete
}) {
  const [title, setTitle] = React.useState(initial.title || '');
  const [confirm, setConfirm] = React.useState(false);
  const [cat, setCat] = React.useState(initial.cat || 'Dinner');
  const [time, setTime] = React.useState(initial.time ? String(initial.time) : '');
  const [ings, setIngs] = React.useState(initial.ingredients && initial.ingredients.length ? initial.ingredients.map(x => ({
    name: x[0],
    amt: x[1] || ''
  })) : [{
    name: '',
    amt: ''
  }]);
  const [steps, setSteps] = React.useState(initial.steps && initial.steps.length ? [...initial.steps] : ['']);
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--ink)',
    background: 'var(--card)',
    border: '1.5px solid var(--line-2)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 13px',
    outline: 'none'
  };
  const label = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    display: 'block',
    marginBottom: 8
  };
  const setIng = (i, k, v) => setIngs(ings.map((x, j) => j === i ? {
    ...x,
    [k]: v
  } : x));
  const addIng = () => setIngs([...ings, {
    name: '',
    amt: ''
  }]);
  const delIng = i => setIngs(ings.length > 1 ? ings.filter((_, j) => j !== i) : ings);
  const setStep = (i, v) => setSteps(steps.map((s, j) => j === i ? v : s));
  const addStep = () => setSteps([...steps, '']);
  const delStep = i => setSteps(steps.length > 1 ? steps.filter((_, j) => j !== i) : steps);
  const canSave = title.trim().length > 0;
  const submit = () => {
    if (!canSave) return;
    onSubmit({
      title: title.trim(),
      cat,
      time: parseInt(time, 10) || 30,
      diff: initial.diff || 'Easy',
      servings: 4,
      blurb: '',
      ingredients: ings.filter(x => x.name.trim()).map(x => [x.name.trim(), x.amt.trim()]),
      steps: steps.map(s => s.trim()).filter(Boolean)
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 95,
      background: 'var(--paper)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 56,
      padding: '56px 16px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 15,
      color: 'var(--ink-2)'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("span", {
    className: "overline"
  }, scanned || editing ? 'Edit recipe' : 'New recipe'), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: !canSave,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: canSave ? 'pointer' : 'default',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 15,
      color: canSave ? 'var(--primary)' : 'var(--ink-3)'
    }
  }, "Save")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '18px 20px 40px'
    }
  }, scanned && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--accent-soft)',
      borderRadius: 'var(--r-md)',
      padding: '10px 13px',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 16,
    color: "var(--accent-hover)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--accent-hover)'
    }
  }, "Scanned \u2014 check the details below")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Recipe name"), /*#__PURE__*/React.createElement("input", {
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: "e.g. Grandma's lasagna",
    style: {
      ...inputStyle,
      fontFamily: 'var(--font-display)',
      fontSize: 19
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Category"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 2,
      scrollbarWidth: 'none'
    }
  }, FORM_CATS.map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    active: cat === c,
    onClick: () => setCat(c)
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Time (min)"), /*#__PURE__*/React.createElement("input", {
    value: time,
    onChange: e => setTime(e.target.value.replace(/[^0-9]/g, '')),
    inputMode: "numeric",
    placeholder: "30",
    style: {
      ...inputStyle,
      fontFamily: 'var(--font-mono)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Ingredients"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, ings.map((x, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: x.name,
    onChange: e => setIng(i, 'name', e.target.value),
    placeholder: "Ingredient",
    style: {
      ...inputStyle,
      flex: 1,
      minWidth: 0
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: x.amt,
    onChange: e => setIng(i, 'amt', e.target.value),
    placeholder: "Amt",
    style: {
      ...inputStyle,
      width: 76,
      flexShrink: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 13.5,
      textAlign: 'center',
      padding: '12px 8px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => delIng(i),
    "aria-label": "Remove ingredient",
    style: {
      flexShrink: 0,
      width: 38,
      height: 38,
      borderRadius: 'var(--r-sm)',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 17,
    color: "var(--ink-3)"
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: addIng,
    style: {
      marginTop: 10,
      width: '100%',
      border: '1.5px dashed var(--line-2)',
      background: 'transparent',
      borderRadius: 'var(--r-sm)',
      padding: '11px 0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 16,
    color: "var(--primary)"
  }), "Add ingredient")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Method"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      marginTop: 9,
      width: 26,
      height: 26,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary-soft)',
      color: 'var(--primary-press)',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, i + 1), /*#__PURE__*/React.createElement("textarea", {
    value: s,
    onChange: e => setStep(i, e.target.value),
    placeholder: "Describe this step\u2026",
    rows: 2,
    style: {
      ...inputStyle,
      flex: 1,
      minWidth: 0,
      resize: 'none',
      lineHeight: 1.45
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => delStep(i),
    "aria-label": "Remove step",
    style: {
      flexShrink: 0,
      marginTop: 5,
      width: 38,
      height: 38,
      borderRadius: 'var(--r-sm)',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 17,
    color: "var(--ink-3)"
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: addStep,
    style: {
      marginTop: 10,
      width: '100%',
      border: '1.5px dashed var(--line-2)',
      background: 'transparent',
      borderRadius: 'var(--r-sm)',
      padding: '11px 0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 16,
    color: "var(--primary)"
  }), "Add step")), editing && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirm(true),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: 'var(--danger-soft)',
      color: 'var(--danger)',
      border: 'none',
      borderRadius: 'var(--r-sm)',
      padding: '14px 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 15
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 18,
    color: "var(--danger)"
  }), "Delete recipe"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 20px 34px',
      borderTop: '1px solid var(--line)',
      background: 'var(--paper)'
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    kind: "primary",
    full: true,
    icon: "check",
    onClick: submit,
    style: {
      opacity: canSave ? 1 : 0.5
    }
  }, editing ? 'Save changes' : 'Save to cookbook')), confirm && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'rgba(28,24,19,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 300,
      background: 'var(--paper)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 22px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 19,
      color: 'var(--ink)'
    }
  }, "Delete recipe?"), /*#__PURE__*/React.createElement("p", {
    className: "small",
    style: {
      margin: '8px 0 0'
    }
  }, "\u201C", title || 'This recipe', "\u201D will be removed from your cookbook. This can\u2019t be undone.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirm(false),
    style: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      padding: '14px 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 16,
      color: 'var(--ink-2)',
      borderRight: '1px solid var(--line)'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setConfirm(false);
      onDelete && onDelete(initial.id);
    },
    style: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      padding: '14px 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--danger)'
    }
  }, "Delete")))));
}
function ScanScreen({
  onClose,
  onSubmit,
  initialPhase = 'aim'
}) {
  const [phase, setPhase] = React.useState(initialPhase); // aim | scanning | edit
  const detected = {
    title: "Nonna's slow ragù",
    cat: 'Dinner',
    time: 180,
    diff: 'Medium',
    ingredients: [['Beef chuck', '500 g'], ['Pork mince', '300 g'], ['Soffritto', '1 cup'], ['San Marzano tomatoes', '800 g'], ['Red wine', '250 ml'], ['Whole milk', '200 ml']],
    steps: ['Brown the beef and pork in batches.', 'Soften the soffritto, deglaze with wine.', 'Add tomatoes and milk; simmer low for 3 hours.']
  };
  const blank = {
    title: '',
    cat: 'Dinner',
    time: '',
    diff: 'Easy',
    ingredients: [],
    steps: []
  };
  const [draft, setDraft] = React.useState(detected);
  const [scanned, setScanned] = React.useState(true);
  const [picked, setPicked] = React.useState(null); // data URL of chosen photo
  const fileRef = React.useRef(null);
  const capture = () => {
    setPhase('scanning');
    setTimeout(() => {
      setDraft(detected);
      setScanned(true);
      setPhase('edit');
    }, 1900);
  };
  const manual = () => {
    setDraft(blank);
    setScanned(false);
    setPhase('edit');
  };
  const onPick = e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPicked(reader.result);
      setPhase('scanning');
      setTimeout(() => {
        setDraft(detected);
        setScanned(true);
        setPhase('edit');
      }, 1900);
    };
    reader.readAsDataURL(file);
  };
  if (phase === 'edit') {
    return /*#__PURE__*/React.createElement(RecipeForm, {
      initial: draft,
      scanned: scanned,
      onCancel: onClose,
      onSubmit: onSubmit
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      background: '#16110D',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 56,
      padding: '56px 18px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "x",
    onClick: onClose,
    size: 40,
    testId: "scanclose"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 15,
      color: '#fff',
      whiteSpace: 'nowrap'
    }
  }, "Scan a recipe"), /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "zap",
    size: 40
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, picked ? /*#__PURE__*/React.createElement("img", {
    src: picked,
    alt: "Selected recipe",
    style: {
      display: 'block',
      width: 240,
      maxHeight: 360,
      objectFit: 'cover',
      borderRadius: 10,
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }
  }) : /*#__PURE__*/React.createElement(FauxPage, null), [0, 1, 2, 3].map(i => {
    const pos = [{
      top: -16,
      left: -16
    }, {
      top: -16,
      right: -16
    }, {
      bottom: -16,
      right: -16
    }, {
      bottom: -16,
      left: -16
    }][i];
    const bord = [{
      borderTop: 1,
      borderLeft: 1
    }, {
      borderTop: 1,
      borderRight: 1
    }, {
      borderBottom: 1,
      borderRight: 1
    }, {
      borderBottom: 1,
      borderLeft: 1
    }][i];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        width: 30,
        height: 30,
        ...pos,
        borderTopWidth: bord.borderTop ? 3 : 0,
        borderLeftWidth: bord.borderLeft ? 3 : 0,
        borderRightWidth: bord.borderRight ? 3 : 0,
        borderBottomWidth: bord.borderBottom ? 3 : 0,
        borderStyle: 'solid',
        borderColor: 'var(--primary)',
        borderRadius: 4
      }
    });
  }), phase === 'scanning' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -6,
      right: -6,
      height: 3,
      background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
      boxShadow: '0 0 16px var(--gold)',
      animation: 'sweep 1.4s ease-in-out infinite'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 26,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      color: 'rgba(255,255,255,0.75)'
    }
  }, phase === 'scanning' ? picked ? 'Reading your photo…' : 'Reading the recipe…' : 'Line up the page, or pick a photo')), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/*",
    onChange: onPick,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 0 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 34
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => fileRef.current && fileRef.current.click(),
    disabled: phase === 'scanning',
    "aria-label": "Choose from camera roll",
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      border: '2px solid rgba(255,255,255,0.55)',
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(6px)',
      cursor: phase === 'scanning' ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: phase === 'scanning' ? 0.4 : 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "image",
    size: 24,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: capture,
    disabled: phase === 'scanning',
    style: {
      width: 74,
      height: 74,
      borderRadius: 'var(--r-pill)',
      border: '5px solid rgba(255,255,255,0.85)',
      background: phase === 'scanning' ? 'var(--gold)' : 'var(--primary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: phase === 'scanning' ? 'loader' : 'camera',
    size: 28,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      flexShrink: 0
    }
  })), phase !== 'scanning' && /*#__PURE__*/React.createElement("button", {
    onClick: manual,
    style: {
      border: 'none',
      background: 'rgba(255,255,255,0.12)',
      cursor: 'pointer',
      borderRadius: 'var(--r-pill)',
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 14,
      color: '#fff',
      backdropFilter: 'blur(6px)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 16,
    color: "#fff"
  }), "Enter it manually")));
}
Object.assign(window, {
  ScanScreen,
  RecipeForm
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Scan.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ios-frame.jsx
try { (() => {
/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/recipes.jsx
try { (() => {
// recipes.jsx — sample data for the Crave Crafted UI kit (window.RECIPES, window.DISCOVER, window.GRADS)

const GRADS = {
  tomato: 'radial-gradient(120% 95% at 68% 18%, #EFC58C 0%, #D98B4E 42%, #C8553D 86%)',
  honey: 'radial-gradient(120% 95% at 62% 20%, #F2DFA2 0%, #E0A23C 48%, #B97A28 92%)',
  sage: 'radial-gradient(120% 95% at 60% 22%, #DDE4BC 0%, #9CAE6E 52%, #6E8B57 92%)',
  berry: 'radial-gradient(120% 95% at 66% 18%, #ECC4D2 0%, #B56E89 50%, #8A4E6A 92%)',
  cocoa: 'radial-gradient(120% 95% at 70% 16%, #E6C9A2 0%, #B07F4E 50%, #6E4A2E 92%)',
  citrus: 'radial-gradient(120% 95% at 64% 18%, #F4E5A6 0%, #E8C04E 46%, #D98B2E 90%)',
  plum: 'radial-gradient(120% 95% at 66% 18%, #D9C3E0 0%, #9B79B0 50%, #6E4E84 92%)',
  green: 'radial-gradient(120% 95% at 60% 22%, #CFE0B0 0%, #84A85E 52%, #4E7A3E 92%)'
};
const RECIPES = [{
  id: 'gnocchi',
  title: 'Brown butter sage gnocchi',
  cat: 'Dinner',
  time: 30,
  diff: 'Easy',
  rating: 4.8,
  temp: 'Stovetop',
  source: 'manual',
  grad: GRADS.tomato,
  servings: 4,
  blurb: 'Pillowy potato gnocchi crisped in nutty brown butter with fried sage.',
  ingredients: [['Yukon gold potatoes', '600 g'], ['00 flour', '180 g'], ['Egg yolk', '1'], ['Unsalted butter', '4 tbsp'], ['Fresh sage leaves', '12'], ['Parmesan, grated', '40 g'], ['Flaky salt', 'to taste']],
  steps: ['Boil potatoes whole until tender, 35–40 min. Peel while warm and rice them.', 'Fold in flour and yolk just until a soft dough forms — do not overwork.', 'Roll into ropes, cut into pillows, and press over a fork for ridges.', 'Boil in batches until they float, about 90 seconds.', 'Brown the butter with sage until fragrant, toss the gnocchi through, finish with parmesan.']
}, {
  id: 'shakshuka',
  title: 'Smoky red pepper shakshuka',
  cat: 'Breakfast',
  time: 25,
  diff: 'Easy',
  rating: 4.6,
  temp: 'Stovetop',
  source: 'scan',
  grad: GRADS.tomato,
  servings: 2,
  blurb: 'Eggs poached in a spiced tomato and roasted pepper sauce.',
  ingredients: [['Eggs', '4'], ['Crushed tomatoes', '400 g'], ['Roasted red peppers', '2'], ['Smoked paprika', '1 tsp'], ['Cumin', '1 tsp'], ['Feta', '60 g']],
  steps: ['Soften onion, garlic and spices in olive oil.', 'Add peppers and tomatoes; simmer until jammy.', 'Make wells and crack in the eggs; cover and cook to taste.', 'Crumble feta over and finish with herbs.']
}, {
  id: 'ramen',
  title: 'Weeknight miso butter ramen',
  cat: 'Dinner',
  time: 20,
  diff: 'Easy',
  rating: 4.9,
  temp: 'Stovetop',
  source: 'web',
  grad: GRADS.honey,
  servings: 2,
  blurb: 'A fast, deeply savory broth built on white miso and butter.',
  ingredients: [['Fresh ramen noodles', '200 g'], ['White miso', '3 tbsp'], ['Butter', '1 tbsp'], ['Chicken stock', '700 ml'], ['Soft-boiled eggs', '2'], ['Scallions', '3']],
  steps: ['Warm stock and whisk in miso and butter.', 'Cook noodles separately until just done.', 'Divide noodles into bowls, pour over broth.', 'Top with halved eggs and scallions.']
}, {
  id: 'salad',
  title: 'Charred broccoli & lemon',
  cat: 'Vegetarian',
  time: 20,
  diff: 'Easy',
  rating: 4.4,
  temp: '220°C',
  source: 'manual',
  grad: GRADS.sage,
  servings: 4,
  blurb: 'Blistered broccoli with chili, garlic and a bright lemon dressing.',
  ingredients: [['Broccoli', '2 heads'], ['Garlic', '3 cloves'], ['Chili flakes', '1 tsp'], ['Lemon', '1'], ['Olive oil', '3 tbsp']],
  steps: ['Roast broccoli hot until charred at the edges.', 'Sizzle garlic and chili in oil.', 'Toss with lemon juice and zest; serve warm.']
}, {
  id: 'cake',
  title: 'Olive oil & orange cake',
  cat: 'Dessert',
  time: 55,
  diff: 'Medium',
  rating: 4.7,
  temp: '170°C',
  source: 'scan',
  grad: GRADS.citrus,
  servings: 8,
  blurb: 'A tender, fragrant loaf with a crackly sugar top.',
  ingredients: [['Flour', '220 g'], ['Olive oil', '150 ml'], ['Oranges', '2'], ['Sugar', '180 g'], ['Eggs', '3']],
  steps: ['Whisk eggs and sugar until pale.', 'Stream in oil, then orange juice and zest.', 'Fold in flour; bake at 170°C for 45 min.']
}, {
  id: 'curry',
  title: 'Coconut chickpea curry',
  cat: 'Vegetarian',
  time: 35,
  diff: 'Easy',
  rating: 4.8,
  temp: 'Stovetop',
  source: 'web',
  grad: GRADS.honey,
  servings: 4,
  blurb: 'Creamy, warming and entirely pantry-friendly.',
  ingredients: [['Chickpeas', '2 tins'], ['Coconut milk', '400 ml'], ['Curry paste', '3 tbsp'], ['Spinach', '100 g'], ['Lime', '1']],
  steps: ['Fry curry paste until fragrant.', 'Add chickpeas and coconut milk; simmer.', 'Wilt in spinach, finish with lime.']
}, {
  id: 'pasta',
  title: 'Cacio e pepe',
  cat: 'Dinner',
  time: 15,
  diff: 'Medium',
  rating: 4.5,
  temp: 'Stovetop',
  source: 'manual',
  grad: GRADS.cocoa,
  servings: 2,
  blurb: 'Three ingredients, infinite technique.',
  ingredients: [['Tonnarelli', '200 g'], ['Pecorino', '100 g'], ['Black pepper', '2 tsp']],
  steps: ['Toast cracked pepper in a pan.', 'Loosen pecorino with starchy pasta water into a cream.', 'Toss pasta through off the heat until glossy.']
}, {
  id: 'galette',
  title: 'Stone fruit galette',
  cat: 'Dessert',
  time: 70,
  diff: 'Medium',
  rating: 4.6,
  temp: '200°C',
  source: 'scan',
  grad: GRADS.berry,
  servings: 6,
  blurb: 'A rustic free-form tart of summer plums and apricots.',
  ingredients: [['Plums', '4'], ['Apricots', '3'], ['Pastry', '1 round'], ['Sugar', '60 g']],
  steps: ['Toss fruit with sugar.', 'Pile onto pastry; fold the edges in.', 'Bake at 200°C until deeply golden.']
}];
const DISCOVER = [{
  id: 'tikka',
  title: 'Sheet-pan chicken tikka',
  site: 'seriouseats.com',
  cat: 'Dinner',
  time: 40,
  rating: 4.7,
  temp: '220°C',
  servings: 4,
  grad: GRADS.tomato,
  tags: ['One pot', 'High protein'],
  blurb: 'Yogurt-marinated chicken and charred peppers roasted together on a single sheet pan.',
  ingredients: [['Chicken thighs', '700 g'], ['Plain yogurt', '150 g'], ['Tikka paste', '3 tbsp'], ['Bell peppers', '2'], ['Red onion', '1'], ['Lemon', '1'], ['Coriander', 'small bunch']],
  steps: ['Toss the chicken with yogurt and tikka paste; marinate 20 minutes.', 'Spread chicken, peppers and onion across a lined sheet pan.', 'Roast at 220°C for 25–30 minutes until charred at the edges.', 'Finish with lemon and a scatter of coriander.']
}, {
  id: 'focaccia',
  title: 'No-knead rosemary focaccia',
  site: 'kingarthur.com',
  cat: 'Vegetarian',
  time: 180,
  rating: 4.9,
  temp: '220°C',
  servings: 8,
  grad: GRADS.honey,
  tags: ['Vegetarian', 'Budget'],
  blurb: 'An airy, deeply dimpled focaccia with a golden olive-oil crust and crisp rosemary.',
  ingredients: [['Bread flour', '500 g'], ['Water', '400 ml'], ['Instant yeast', '7 g'], ['Olive oil', '60 ml'], ['Rosemary', '2 sprigs'], ['Flaky salt', 'to finish']],
  steps: ['Stir flour, water, yeast and salt into a shaggy dough.', 'Cover and let rise slowly until doubled and bubbly, about 2 hours.', 'Oil a pan, stretch the dough out and dimple all over with your fingers.', 'Scatter rosemary and flaky salt; bake at 220°C until golden, 22–25 minutes.']
}, {
  id: 'pho',
  title: 'Quick weeknight chicken pho',
  site: 'thekitchn.com',
  cat: 'Dinner',
  time: 45,
  rating: 4.6,
  temp: 'Stovetop',
  servings: 4,
  grad: GRADS.cocoa,
  tags: ['Under 45 min', 'High protein'],
  blurb: 'A fragrant, fast chicken pho built on toasted spices, charred ginger and fish sauce.',
  ingredients: [['Chicken stock', '1.5 L'], ['Rice noodles', '200 g'], ['Chicken breast', '2'], ['Ginger', '1 thumb'], ['Star anise', '3'], ['Fish sauce', '2 tbsp'], ['Herbs & lime', 'to serve']],
  steps: ['Char the ginger and toast the star anise in a dry pot.', 'Add stock and chicken; simmer gently until cooked, then shred.', 'Season the broth with fish sauce to taste.', 'Cook the noodles, divide into bowls and ladle over broth, chicken and herbs.']
}, {
  id: 'risotto',
  title: 'Spring pea & mint risotto',
  site: 'bonappetit.com',
  cat: 'Vegetarian',
  time: 35,
  rating: 4.5,
  temp: 'Stovetop',
  servings: 4,
  grad: GRADS.green,
  tags: ['Under 45 min', 'Vegetarian'],
  blurb: 'Creamy arborio risotto brightened with sweet peas, parmesan and fresh mint.',
  ingredients: [['Arborio rice', '300 g'], ['Vegetable stock', '1 L'], ['Peas', '200 g'], ['Parmesan', '50 g'], ['Shallot', '1'], ['White wine', '100 ml'], ['Mint', 'small bunch']],
  steps: ['Soften the shallot in butter, then toast the rice until translucent.', 'Deglaze with wine, then add warm stock a ladle at a time, stirring.', 'When the rice is al dente, stir through peas and parmesan.', 'Finish off the heat with torn mint and a knob of butter.']
}];
Object.assign(window, {
  RECIPES,
  DISCOVER,
  GRADS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/recipes.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ui.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// ui.jsx — shared Crave Crafted primitives (Icon, Pill, Chip, Btn, RecipeCard, TabBar, Toast, PhotoFill)

// ── Lucide icon wrapper ────────────────────────────────────────
function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  fill = false,
  style = {}
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = `<i data-lucide="${name}"></i>`;
    window.lucide.createIcons();
    const svg = el.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', strokeWidth);
      if (fill) svg.setAttribute('fill', 'currentColor');
    }
  });
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      width: size,
      height: size,
      color,
      flexShrink: 0,
      ...style
    }
  });
}

// ── Photo fill (gradient food placeholder w/ soft vignette) ────
function PhotoFill({
  grad,
  style = {},
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: grad,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(40,20,10,0.05) 70%, rgba(40,20,10,0.34) 100%)'
    }
  }), children);
}

// ── Filter chip ────────────────────────────────────────────────
function Chip({
  active,
  children,
  onClick,
  icon
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 14,
      padding: '8px 15px',
      borderRadius: 'var(--r-pill)',
      cursor: 'pointer',
      border: active ? '1.5px solid var(--primary)' : '1.5px solid var(--line-2)',
      background: active ? 'var(--primary)' : 'var(--card)',
      color: active ? 'var(--on-primary)' : 'var(--ink-2)',
      transition: '.15s'
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15
  }), children);
}

// ── Button ─────────────────────────────────────────────────────
function Btn({
  kind = 'primary',
  children,
  onClick,
  icon,
  full,
  style = {}
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    borderRadius: 'var(--r-sm)',
    border: 'none',
    padding: '14px 20px',
    whiteSpace: 'nowrap',
    width: full ? '100%' : undefined,
    transition: '.15s',
    ...style
  };
  const kinds = {
    primary: {
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      boxShadow: 'var(--shadow-sm)'
    },
    secondary: {
      background: 'var(--card)',
      color: 'var(--ink)',
      border: '1.5px solid var(--line-2)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--primary)'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      ...base,
      ...kinds[kind]
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19
  }), children);
}

// ── Round glassy icon button (for photo overlays) ──────────────
function RoundBtn({
  icon,
  onClick,
  light,
  size = 38,
  color,
  testId
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    "data-test": testId,
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--r-pill)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: light ? 'rgba(255,253,249,0.92)' : 'rgba(43,37,33,0.42)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      boxShadow: light ? 'var(--shadow-sm)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size * 0.46,
    color: color || (light ? 'var(--primary)' : '#fff')
  }));
}

// ── Meta row (time / difficulty / rating) ──────────────────────
function Meta({
  time,
  diff,
  rating,
  color = 'var(--ink-2)'
}) {
  const item = (icon, label, fill) => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 500,
      color,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14,
    color: fill ? 'var(--gold)' : 'inherit',
    fill: fill
  }), label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, time != null && item('clock', `${time} min`), diff && item('flame', diff), rating != null && item('star', rating, true));
}

// ── Category color map (imageless cards lean on color + type) ──
const CAT = {
  Dinner: {
    bg: 'var(--primary-soft)',
    fg: 'var(--primary-press)',
    rule: '#F0D8C9'
  },
  Breakfast: {
    bg: 'var(--warning-soft)',
    fg: '#9A6A17',
    rule: '#EDDCBC'
  },
  Vegetarian: {
    bg: 'var(--accent-soft)',
    fg: 'var(--accent-hover)',
    rule: '#D5DCC6'
  },
  Dessert: {
    bg: '#EDDDE6',
    fg: '#8A4E6A',
    rule: '#E2CCD8'
  }
};
function catStyle(c) {
  return CAT[c] || CAT.Dinner;
}

// ── Recipe card — grid (default) or list layout ───────────────
function RecipeCard({
  r,
  onClick,
  onSave,
  onLongPress,
  view = 'grid'
}) {
  const c = catStyle(r.cat);
  const pressT = React.useRef(null);
  const longRef = React.useRef(false);
  const startPos = React.useRef({
    x: 0,
    y: 0
  });
  const begin = e => {
    longRef.current = false;
    startPos.current = {
      x: e.clientX,
      y: e.clientY
    };
    clearTimeout(pressT.current);
    pressT.current = setTimeout(() => {
      longRef.current = true;
      onLongPress && onLongPress(r);
    }, 480);
  };
  const move = e => {
    if (Math.abs(e.clientX - startPos.current.x) > 10 || Math.abs(e.clientY - startPos.current.y) > 10) clearTimeout(pressT.current);
  };
  const end = () => clearTimeout(pressT.current);
  const handleClick = e => {
    if (longRef.current) {
      e.preventDefault();
      e.stopPropagation();
      longRef.current = false;
      return;
    }
    onClick && onClick();
  };
  const press = onLongPress ? {
    onPointerDown: begin,
    onPointerMove: move,
    onPointerUp: end,
    onPointerLeave: end,
    onPointerCancel: end,
    onContextMenu: e => {
      e.preventDefault();
      onLongPress(r);
    },
    style: {
      WebkitTouchCallout: 'none',
      userSelect: 'none'
    }
  } : {};
  const tag = /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 10.5,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      padding: '4px 9px',
      borderRadius: 'var(--r-xs)',
      background: c.bg,
      color: c.fg,
      whiteSpace: 'nowrap'
    }
  }, r.cat);
  if (view === 'list') {
    return /*#__PURE__*/React.createElement("button", _extends({
      onClick: handleClick
    }, press, {
      "data-test": "card",
      style: {
        textAlign: 'left',
        cursor: 'pointer',
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        width: '100%',
        padding: 0,
        display: 'flex',
        alignItems: 'stretch',
        ...(press.style || {})
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 5,
        background: c.fg,
        opacity: 0.85,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '13px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "recipe-title",
      style: {
        fontSize: 18,
        lineHeight: 1.2
      }
    }, r.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, tag, /*#__PURE__*/React.createElement(Meta, {
      time: r.time
    }))));
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: handleClick
  }, press, {
    "data-test": "card",
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      width: '100%',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      ...(press.style || {})
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: c.fg,
      opacity: 0.85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '13px 14px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, tag), /*#__PURE__*/React.createElement("div", {
    className: "recipe-title",
    style: {
      fontSize: 17,
      lineHeight: 1.2,
      minHeight: 41
    }
  }, r.title), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)'
    }
  }), /*#__PURE__*/React.createElement(Meta, {
    time: r.time
  })));
}

// ── Profile avatar (top-right entry to the You screen) ─────────
function Avatar({
  onClick,
  size = 38,
  letter = 'M'
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: size * 0.45,
      border: 'none',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow: 'var(--shadow-xs)'
    }
  }, letter);
}

// ── Bottom tab bar ─────────────────────────────────────────────
function TabBar({
  tab,
  onTab,
  onScan
}) {
  const tabs = [{
    id: 'library',
    icon: 'book-open',
    label: 'Cookbook'
  }, {
    id: 'scan',
    icon: 'camera',
    label: '',
    fab: true
  }, {
    id: 'discover',
    icon: 'search',
    label: 'Discover'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 40,
      paddingBottom: 22,
      background: 'linear-gradient(180deg, rgba(252,247,239,0) 0%, var(--paper) 38%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px',
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-xl)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      padding: '9px 10px 10px'
    }
  }, tabs.map(t => t.fab ? /*#__PURE__*/React.createElement("button", {
    key: t.id,
    "data-test": "fab",
    onClick: onScan,
    style: {
      border: 'none',
      cursor: 'pointer',
      width: 52,
      height: 52,
      marginTop: -26,
      borderRadius: 'var(--r-pill)',
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 25
  })) : /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => onTab(t.id),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      padding: '2px 6px',
      color: tab === t.id ? 'var(--primary)' : 'var(--ink-3)',
      fontFamily: 'var(--font-sans)',
      fontSize: 10.5,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 22
  }), t.label))));
}

// ── Ad banner (shown to free users; Plus removes it) ───────────
function AdBanner({
  onUpgrade
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper-2)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      padding: '12px 13px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 'var(--r-sm)',
      background: 'var(--paper-3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shopping-basket",
    size: 20,
    color: "var(--ink-3)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 9,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--ink-3)',
      border: '1px solid var(--line-2)',
      borderRadius: 3,
      padding: '1px 4px'
    }
  }, "Ad"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 13.5,
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "Fresh Market \u2014 groceries in 1 hour")), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onUpgrade && onUpgrade();
    },
    style: {
      border: 'none',
      background: 'transparent',
      padding: '2px 0 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 12,
      color: 'var(--primary)'
    }
  }, "Remove ads with Plus")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--ink-3)"
  }));
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({
  msg
}) {
  if (!msg) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 110,
      transform: 'translateX(-50%)',
      zIndex: 80,
      background: 'var(--ink)',
      color: 'var(--paper)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 14,
      padding: '11px 18px',
      borderRadius: 'var(--r-pill)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 17,
    color: "var(--accent)"
  }), msg);
}
Object.assign(window, {
  Icon,
  PhotoFill,
  Chip,
  Btn,
  RoundBtn,
  Meta,
  RecipeCard,
  TabBar,
  Toast,
  catStyle,
  Avatar,
  AdBanner
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ui.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/units.jsx
try { (() => {
// units.jsx — applies the user's measurement preference to recipe amounts & temps.
// Exposes window.CCUnits = { convertAmount, convertTemp, fmtNum }.
// prefs shape: { system: 'metric'|'us'|'uk', temp: 'C'|'F', fractions: bool }
(function () {
  // common cooking fractions (eighths + thirds) → unicode glyphs
  const FRAC = [[0, ''], [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.375, '⅜'], [0.5, '½'], [0.625, '⅝'], [0.667, '⅔'], [0.75, '¾'], [0.875, '⅞'], [1, '']];
  function fmtNum(n, useFrac) {
    n = Math.round(n * 1000) / 1000;
    if (Math.abs(n - Math.round(n)) < 0.02) return String(Math.round(n));
    if (useFrac) {
      const whole = Math.floor(n);
      const frac = n - whole;
      let best = FRAC[0],
        bd = 1;
      for (const f of FRAC) {
        const d = Math.abs(frac - f[0]);
        if (d < bd) {
          bd = d;
          best = f;
        }
      }
      if (best[0] === 1) return String(whole + 1);
      if (best[1] === '') return String(whole || 0);
      return (whole > 0 ? whole : '') + best[1];
    }
    return (Math.round(n * 100) / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
  const round5 = n => Math.round(n / 5) * 5;

  // convert any "NNN°C" occurrences in a string to °F when the pref is Fahrenheit
  function convertTemp(text, prefs) {
    if (text == null || !prefs || prefs.temp !== 'F') return text;
    return String(text).replace(/(\d+(?:\.\d+)?)\s*°\s*C/g, (_, c) => round5(parseFloat(c) * 9 / 5 + 32) + '°F');
  }

  // convert one ingredient amount string (already optionally scaled by `ratio`)
  function convertAmount(amtStr, ratio, prefs) {
    prefs = prefs || {
      system: 'metric',
      temp: 'C',
      fractions: true
    };
    ratio = ratio || 1;
    const m = String(amtStr).match(/^([\d.]+)\s*(.*)$/);
    if (!m) return amtStr; // no leading number → "to taste", "small bunch", etc.
    let value = parseFloat(m[1]) * ratio;
    let unit = (m[2] || '').trim();
    const u = unit.toLowerCase();
    const imperial = prefs.system === 'us' || prefs.system === 'uk';
    if (imperial) {
      if (u === 'g') {
        if (value >= 453.592) {
          value = value / 453.592;
          unit = 'lb';
        } else {
          value = value / 28.3495;
          unit = 'oz';
        }
      } else if (u === 'kg') {
        value = value * 2.20462;
        unit = 'lb';
      } else if (u === 'ml') {
        value = value / 29.5735;
        unit = 'fl oz';
      } else if (u === 'l') {
        value = value * 4.22675;
        unit = 'cups';
      }
    }
    // metric: g / ml / kg / l left as entered. tbsp/tsp/counts unchanged in all systems.

    const numStr = fmtNum(value, prefs.fractions !== false);
    return unit ? numStr + ' ' + unit : numStr;
  }

  // ── quick conversions: same-dimension equivalents for one ingredient ──
  // weight↔weight and volume↔volume only (no density guessing). Returns
  // [{ label }] of up to 3 useful alternates, or null if not convertible.
  const WT_G = {
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592
  };
  const VOL_ML = {
    tsp: 4.92892,
    tbsp: 14.7868,
    ml: 1,
    'fl oz': 29.5735,
    cup: 236.588,
    cups: 236.588,
    l: 1000
  };
  function quickConversions(amtStr, ratio, prefs) {
    ratio = ratio || 1;
    prefs = prefs || {
      system: 'metric'
    };
    const m = String(amtStr).match(/^([\d.]+)\s*(.*)$/);
    if (!m) return null;
    const value = parseFloat(m[1]) * ratio;
    const u = (m[2] || '').trim().toLowerCase();
    let base, table, order;
    if (WT_G[u] != null) {
      base = value * WT_G[u];
      table = WT_G;
      order = ['oz', 'lb', 'g', 'kg'];
    } else if (VOL_ML[u] != null) {
      base = value * VOL_ML[u];
      table = VOL_ML;
      order = ['tbsp', 'tsp', 'cup', 'ml', 'fl oz', 'l'];
    } else return null;

    // figure out which unit the row already shows, so we don't repeat it
    const imperial = prefs.system === 'us' || prefs.system === 'uk';
    let shown = u;
    if (imperial) {
      if (u === 'g') shown = base >= 453.592 ? 'lb' : 'oz';else if (u === 'kg') shown = 'lb';else if (u === 'ml') shown = 'fl oz';else if (u === 'l') shown = 'cup';
    }
    const FRAC_UNITS = {
      tbsp: 1,
      tsp: 1,
      cup: 1,
      'fl oz': 1
    };
    const out = [];
    for (const unit of order) {
      if (unit === u || unit === shown || unit === 'cups') continue;
      const conv = base / table[unit];
      if (conv < 0.08 || conv > 2000) continue; // skip silly magnitudes
      let label = unit;
      if (unit === 'cup') label = conv < 1.02 ? 'cup' : 'cups';
      out.push(fmtNum(conv, !!FRAC_UNITS[unit]) + ' ' + label);
      if (out.length === 3) break;
    }
    return out.length ? out : null;
  }
  const ORDER = {
    weight: ['g', 'oz', 'lb', 'kg'],
    volume: ['tsp', 'tbsp', 'cup', 'ml', 'fl oz', 'l']
  };
  function parseAmt(amtStr, ratio) {
    const m = String(amtStr).match(/^([\d.]+)\s*(.*)$/);
    if (!m) return null;
    return {
      value: parseFloat(m[1]) * (ratio || 1),
      unit: (m[2] || '').trim().toLowerCase()
    };
  }
  function dimensionOf(u) {
    if (WT_G[u] != null) return 'weight';
    if (VOL_ML[u] != null) return 'volume';
    return null;
  }
  function label(unit, conv) {
    if (unit === 'cup') return conv < 1.02 ? 'cup' : 'cups';
    return unit;
  }

  // format `amtStr` (scaled by ratio) expressed in a specific target `unit`
  function amountInUnit(amtStr, ratio, unit, prefs) {
    const p = parseAmt(amtStr, ratio);
    if (!p) return amtStr;
    const dim = dimensionOf(p.unit);
    if (!dim) return amtStr;
    const table = dim === 'weight' ? WT_G : VOL_ML;
    if (table[unit] == null) return amtStr;
    const conv = p.value * table[p.unit] / table[unit];
    const frac = prefs ? prefs.fractions !== false : true;
    return fmtNum(conv, frac) + ' ' + label(unit, conv);
  }

  // the unit convertAmount would naturally display for current prefs
  function displayUnit(amtStr, ratio, prefs) {
    const p = parseAmt(amtStr, ratio);
    if (!p) return null;
    const u = p.unit;
    const imperial = prefs && (prefs.system === 'us' || prefs.system === 'uk');
    if (imperial) {
      if (u === 'g') return p.value >= 453.592 ? 'lb' : 'oz';
      if (u === 'kg') return 'lb';
      if (u === 'ml') return 'fl oz';
      if (u === 'l') return 'cup';
    }
    return u;
  }

  // selectable units (same dimension) for one ingredient, each with its value.
  // returns [{ unit, value }] (≥2 entries) or null when not convertible.
  function unitOptions(amtStr, ratio, prefs) {
    const p = parseAmt(amtStr, ratio);
    if (!p) return null;
    const dim = dimensionOf(p.unit);
    if (!dim) return null;
    const table = dim === 'weight' ? WT_G : VOL_ML;
    const base = p.value * table[p.unit];
    const frac = prefs ? prefs.fractions !== false : true;
    const out = [];
    for (const unit of ORDER[dim]) {
      const conv = base / table[unit];
      const isSource = unit === p.unit;
      if (!isSource && (conv < 0.05 || conv > 4000)) continue; // hide silly magnitudes
      out.push({
        unit,
        value: fmtNum(conv, frac) + ' ' + label(unit, conv)
      });
    }
    return out.length > 1 ? out : null;
  }
  window.CCUnits = {
    convertAmount,
    convertTemp,
    fmtNum,
    quickConversions,
    unitOptions,
    amountInUnit,
    displayUnit
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/units.jsx", error: String((e && e.message) || e) }); }

})();
