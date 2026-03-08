import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Inflows } from "./inflows";

describe("Inflows", () => {
  let component: Inflows;
  let fixture: ComponentFixture<Inflows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inflows],
    }).compileComponents();

    fixture = TestBed.createComponent(Inflows);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
