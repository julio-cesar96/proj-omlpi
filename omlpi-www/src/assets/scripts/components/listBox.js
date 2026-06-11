export default {
  name: 'ListBox',
  template: '#list-box-markup',
  inheritAttrs: false,
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    labelForEmpty: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'single_choice',
    },
    value: {
      type: [Array, Number, String],
      default: () => [],
      validator: (value) => !(!Array.isArray(value) && typeof value === 'object'),
    },
  },
  computed: {
    currentValues({ value = '' } = this) {
      return value && Array.isArray(value)
        ? value.map((x) => String(x))
        : [String(value)];
    },
    normalizedOptions({ options } = this) {
      return options.map((x) => (typeof x === 'object' ? {
        ...x, id: x.id || x.value, label: x.label || x.acronym || x.name, value: typeof x.value !== 'undefined' ? JSON.stringify(x.value) : JSON.stringify(x.id),
      } : x)) || [];
    },
    normalizedType({ multiple, options } = this) {
      if (!multiple) {
        if (options.length <= 6) {
          return 'radio';
        }
        return 'select';
      }
      return 'checkbox';
    },
    lastSelected({ currentValues, normalizedOptions } = this) {
      let i = normalizedOptions.length - 1;

      while (normalizedOptions[i]) {
        const value = String(normalizedOptions[i]?.value);
        if (currentValues.includes(value)) {
          return value;
        }
        i -= 1;
      }
      return '';
    },
  },
  methods: {
    emit(e) {
      const { value } = e.target;
      const { multiple, currentValues } = this;

      if (multiple) {
        let newValues = [];
        if (value) {
          newValues = e.target.checked
            ? currentValues.concat([value])
            // eslint-disable-next-line eqeqeq
            : currentValues.filter((x) => x != value);
        } else {
          console.debug('value', value);
          this.$refs.empty.checked = true;
          this.value = [];
        }

        this.$emit('change', newValues);
        this.$emit('input', newValues);
      } else {
        this.$emit('change', value);
        this.$emit('input', value);
      }
    },
  },
};
