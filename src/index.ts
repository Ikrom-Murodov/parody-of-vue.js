import SimpleParodyOfVue from './ts';

const instance = new SimpleParodyOfVue({
  $el: '#app',

  data: {
    user: {
      name: 'Ikrom',
      surname: 'Murodov',
      age: 19,
    },
    styles: {
      div: {
        border: '1px solid red',
        margin: '20px',
        padding: '20px',
        borderRadius: '5px',
      },
    },
    button: {
      marginTop: '20px',
      marginBottom: '20px',
      display: 'block',
    },
  },

  methods: {
    changeUserAge(): void {
      this.user.age = Math.ceil(Math.random() * 100);
    },

    changeBorderRadius(): void {
      this.styles.div.borderRadius = `${Math.ceil(Math.random() * 100)}px`;
    },
  },

  computed: {
    showFullName(): string {
      console.log('show full name');
      const { user } = this;
      return `Name: ${user.name} - Surname: ${user.surname} - Age: ${user.age}`;
    },
  },

  template: `
    <div :style="styles.div" class="container">
      <h1 class="container__user">
        User info: {{ user.name }} - {{ user.surname }} - {{ user.age }}
      </h1>

      <div class="container__changed">
        <button @click="changeUserAge" :style="button" style="cursor: pointer">
          Change user age.
        </button>

        <button :style="button" style="cursor: pointer" @click="changeBorderRadius">
          change border radius.
        </button>
      </div>
    </div>
  `,
});
