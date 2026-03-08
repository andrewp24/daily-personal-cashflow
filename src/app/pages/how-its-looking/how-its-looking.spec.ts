import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HowItsLooking } from "./how-its-looking";

describe("HowItsLooking", () => {
  let component: HowItsLooking;
  let fixture: ComponentFixture<HowItsLooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowItsLooking],
    }).compileComponents();

    fixture = TestBed.createComponent(HowItsLooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
