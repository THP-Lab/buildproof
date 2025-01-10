import type { Meta, StoryObj } from '@storybook/react'

import {
  SidebarLayout,
  SidebarLayoutContent,
  SidebarLayoutNav,
  SidebarLayoutNavAvatar,
  SidebarLayoutNavBody,
  SidebarLayoutNavHeader,
  SidebarLayoutNavHeaderButton,
  SidebarLayoutProvider,
  SidebarNavItem,
} from '.'

const meta: Meta<typeof SidebarLayout> = {
  title: 'Components/SidebarLayout',
  component: SidebarLayout,
}

export default meta

type Story = StoryObj<typeof SidebarLayout>

export const BasicUsage: Story = {
  render: (args) => (
    <div
      style={{ width: '800px', height: '500px' }}
      className="border-border/30 rounded-lg border"
    >
      <SidebarLayoutProvider>
        <SidebarLayout {...args}>
          <SidebarLayoutNav>
            <SidebarLayoutNavHeader>
              <SidebarLayoutNavHeaderButton
                imgLogo={
                  <svg width="25" height="25" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="256" height="256" rx="16" fill="#0A100D"/>
                    <rect x="106" y="194" width="72" height="12" rx="6" fill="#FF8964"/>
                    <rect x="106" y="170" width="100" height="12" rx="6" fill="#FF8964"/>
                    <rect x="162" y="146" width="44" height="12" rx="6" fill="#FF8964"/>
                    <rect x="106" y="146" width="44" height="12" rx="6" fill="#FF8964"/>
                    <rect x="50" y="194" width="44" height="12" rx="6" fill="#E33B3B"/>
                    <rect x="50" y="170" width="44" height="12" rx="6" fill="#E33B3B"/>
                    <rect x="50" y="146" width="44" height="12" rx="6" fill="#E33B3B"/>
                    <rect x="50" y="122" width="128" height="12" rx="6" fill="#E33B3B"/>
                    <rect x="134" y="98.0001" width="72" height="12" rx="6" fill="#E33B3B"/>
                    <rect x="50" y="98" width="72" height="12" rx="6" fill="#FF8964"/>
                    <rect x="106" y="74.0001" width="100" height="12" rx="6" fill="#E33B3B"/>
                    <rect x="50" y="74" width="44" height="12" rx="6" fill="#FF8964"/>
                    <rect x="50" y="50" width="128" height="12" rx="6" fill="#E33B3B"/>
                  </svg>
                }
                textLogo={
                  <svg
                    width="101"
                    height="14"
                    viewBox="0 0 101 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.638672 0.718803H2.31411V13.2815H0.638672V0.718803ZM7.24154 0.718803H9.44055L16.247 11.0457H16.2819V0.718803H17.9574V13.2815H15.8282L8.95188 2.95453H8.91697V13.2815H7.24154V0.718803ZM25.46 2.31575H21.4808V0.718803H31.1146V2.31575H27.1354V13.2815H25.46V2.31575ZM36.0925 0.718803V8.41965C36.0925 8.81001 36.1448 9.21812 36.2495 9.64397C36.3542 10.058 36.5288 10.4424 36.7731 10.7973C37.0174 11.1522 37.3374 11.442 37.733 11.6668C38.1286 11.8915 38.6172 12.0039 39.199 12.0039C39.7807 12.0039 40.2694 11.8915 40.665 11.6668C41.0606 11.442 41.3806 11.1522 41.6249 10.7973C41.8692 10.4424 42.0438 10.058 42.1485 9.64397C42.2532 9.21812 42.3055 8.81001 42.3055 8.41965V0.718803H43.981V8.6858C43.981 9.41922 43.8588 10.0876 43.6145 10.6909C43.3701 11.2823 43.0327 11.7969 42.6022 12.2346C42.1717 12.6723 41.6656 13.0094 41.0839 13.246C40.5021 13.4826 39.8738 13.6009 39.199 13.6009C38.5242 13.6009 37.8959 13.4826 37.3141 13.246C36.7324 13.0094 36.2263 12.6723 35.7958 12.2346C35.3653 11.7969 35.0278 11.2823 34.7835 10.6909C34.5392 10.0876 34.417 9.41922 34.417 8.6858V0.718803H36.0925ZM48.6772 0.718803H50.3526V13.2815H48.6772V0.718803ZM57.863 2.31575H53.8838V0.718803H63.5176V2.31575H59.5384V13.2815H57.863V2.31575ZM67.0469 0.718803H68.7223V13.2815H67.0469V0.718803ZM79.3213 13.6009C78.3789 13.6009 77.5121 13.4352 76.7209 13.104C75.9297 12.761 75.2491 12.2937 74.679 11.7023C74.1205 11.1108 73.6784 10.4129 73.3526 9.60849C73.0384 8.8041 72.8814 7.93465 72.8814 7.00014C72.8814 6.06563 73.0384 5.19618 73.3526 4.39179C73.6784 3.5874 74.1205 2.88947 74.679 2.29801C75.2491 1.70655 75.9297 1.24521 76.7209 0.913987C77.5121 0.570939 78.3789 0.399414 79.3213 0.399414C80.2638 0.399414 81.1306 0.570939 81.9217 0.913987C82.7129 1.24521 83.3878 1.70655 83.9462 2.29801C84.5164 2.88947 84.9585 3.5874 85.2726 4.39179C85.5984 5.19618 85.7613 6.06563 85.7613 7.00014C85.7613 7.93465 85.5984 8.8041 85.2726 9.60849C84.9585 10.4129 84.5164 11.1108 83.9462 11.7023C83.3878 12.2937 82.7129 12.761 81.9217 13.104C81.1306 13.4352 80.2638 13.6009 79.3213 13.6009ZM79.3213 12.0039C80.0311 12.0039 80.671 11.8738 81.2411 11.6135C81.8112 11.3415 82.2999 10.9807 82.7071 10.5312C83.1143 10.0817 83.4285 9.55525 83.6496 8.95196C83.8706 8.33684 83.9811 7.68623 83.9811 7.00014C83.9811 6.31404 83.8706 5.66935 83.6496 5.06605C83.4285 4.45093 83.1143 3.91862 82.7071 3.4691C82.2999 3.01959 81.8112 2.66471 81.2411 2.40447C80.671 2.1324 80.0311 1.99636 79.3213 1.99636C78.6116 1.99636 77.9717 2.1324 77.4016 2.40447C76.8314 2.66471 76.3428 3.01959 75.9355 3.4691C75.5283 3.91862 75.2142 4.45093 74.9931 5.06605C74.772 5.66935 74.6615 6.31404 74.6615 7.00014C74.6615 7.68623 74.772 8.33684 74.9931 8.95196C75.2142 9.55525 75.5283 10.0817 75.9355 10.5312C76.3428 10.9807 76.8314 11.3415 77.4016 11.6135C77.9717 11.8738 78.6116 12.0039 79.3213 12.0039ZM89.9155 0.718803H92.1145L98.921 11.0457H98.9559V0.718803H100.631V13.2815H98.5021L91.6258 2.95453H91.5909V13.2815H89.9155V0.718803Z"
                      fill="#E5E5E5"
                    />
                  </svg>
                }
                productLogo={
                  <svg
                    width="75"
                    height="22"
                    viewBox="0 0 75 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1.13135"
                      y="1"
                      width="73"
                      height="20"
                      rx="5.5"
                      fill="url(#paint0_linear_12803_13204)"
                      fillOpacity="0.9"
                    />
                    <rect
                      x="1.13135"
                      y="1"
                      width="73"
                      height="20"
                      rx="5.5"
                      fill="url(#paint1_linear_12803_13204)"
                      fillOpacity="0.2"
                    />
                    <rect
                      x="1.13135"
                      y="1"
                      width="73"
                      height="20"
                      rx="5.5"
                      stroke="url(#paint2_linear_12803_13204)"
                    />
                    <path
                      d="M7.9245 6.98H13.8525V8.516H9.7485V10.472H13.7085V11.984H9.7485V13.964H13.9485V15.5H7.9245V6.98ZM21.6413 6.98H23.7293L20.8373 11.216L23.7533 15.5H21.6533L19.7813 12.584L17.8973 15.5H15.7973L18.7133 11.216L15.8213 6.98H17.9213L19.7933 9.836L21.6413 6.98ZM29.1431 6.98C31.1831 6.98 32.4191 8.036 32.4191 9.764C32.4191 11.492 31.1831 12.56 29.1431 12.56H27.5591V15.5H25.7351V6.98H29.1431ZM27.5591 11.024H29.0351C29.9951 11.024 30.5471 10.592 30.5471 9.764C30.5471 8.936 29.9951 8.516 29.0351 8.516H27.5591V11.024ZM34.7459 15.5V6.98H36.5699V13.964H40.4939V15.5H34.7459ZM46.153 15.692C43.561 15.692 42.013 13.988 42.013 11.252C42.013 8.492 43.561 6.788 46.153 6.788C48.745 6.788 50.305 8.492 50.305 11.252C50.305 13.988 48.745 15.692 46.153 15.692ZM43.897 11.252C43.897 13.076 44.737 14.156 46.153 14.156C47.593 14.156 48.421 13.076 48.421 11.252C48.421 9.416 47.593 8.324 46.153 8.324C44.737 8.324 43.897 9.416 43.897 11.252ZM56.2065 6.98C57.9705 6.98 59.2665 7.892 59.2665 9.536C59.2665 10.616 58.6425 11.348 57.7185 11.588C58.6305 11.696 59.0625 12.128 59.1345 13.052L59.3505 15.5H57.5145L57.3465 13.364C57.2865 12.62 56.8905 12.38 55.8945 12.38H54.2985V15.5H52.4745V6.98H56.2065ZM54.2985 10.856H55.9425C56.8785 10.856 57.3945 10.436 57.3945 9.692C57.3945 8.936 56.8905 8.516 55.9425 8.516H54.2985V10.856ZM61.6493 6.98H67.5773V8.516H63.4733V10.472H67.4333V11.984H63.4733V13.964H67.6733V15.5H61.6493V6.98Z"
                      fill="black"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_12803_13204"
                        x1="45.6313"
                        y1="0.499999"
                        x2="45.0239"
                        y2="21.4824"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="#736961" />
                      </linearGradient>
                      <linearGradient
                        id="paint1_linear_12803_13204"
                        x1="74.6313"
                        y1="11"
                        x2="0.631348"
                        y2="11"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopOpacity="0" />
                        <stop
                          offset="0.0793919"
                          stopColor="white"
                          stopOpacity="0.8"
                        />
                        <stop
                          offset="0.955"
                          stopColor="#FBFBFB"
                          stopOpacity="0.786437"
                        />
                        <stop offset="1" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient
                        id="paint2_linear_12803_13204"
                        x1="27.6314"
                        y1="0.5"
                        x2="27.6314"
                        y2="21.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white" stopOpacity="0.24" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                }
              />
            </SidebarLayoutNavHeader>
            <SidebarLayoutNavBody className="flex flex-col justify-between">
              <div className="flex flex-col gap-px">
                <SidebarNavItem
                  iconName="crystal-ball"
                  label="Explore This"
                  onClick={() => null}
                />
                <SidebarNavItem
                  iconName="megaphone"
                  label="Explore That"
                  onClick={() => null}
                />
              </div>
              <div className="flex flex-col gap-px">
                <SidebarNavItem
                  iconName="settings-gear"
                  label="Settings"
                  onClick={() => null}
                />
                <SidebarLayoutNavAvatar
                  imageSrc="https://m.media-amazon.com/images/M/MV5BNDhiMWYzMjgtNTRiYi00ZTA3LThlODctNDRkMDk0NzFkMWI3L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNTg0MTkzMzA@._V1_.jpg"
                  name="Super Dave"
                  onClick={() => null}
                />
              </div>
            </SidebarLayoutNavBody>
          </SidebarLayoutNav>
          <SidebarLayoutContent className="p-6 flex justify-center items-center">
            Content goes here.
          </SidebarLayoutContent>
        </SidebarLayout>
      </SidebarLayoutProvider>
    </div>
  ),
}
