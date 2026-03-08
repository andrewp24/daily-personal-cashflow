import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Outflows } from "./outflows";

describe("Outflows", () => {
  let component: Outflows;
  let fixture: ComponentFixture<Outflows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Outflows],
    }).compileComponents();

    fixture = TestBed.createComponent(Outflows);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
