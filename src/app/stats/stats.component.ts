import { Component, DestroyRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../game/game.service';
import {
  GameHistoryModel,
  GetCurrentGameDto,
  StatsModel,
  TurnDistributionModel,
  WordDistributionModel,
  WordLengthDistributionModel,
} from '../game/game.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MatSlideToggleModule,
    ScrollingModule,
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent implements OnInit {
  viewToggle!: boolean;
  flipToggle: boolean = false;
  stats: StatsModel | null = null;
  fastestWinByTime: string = '-';

  wordLengthDataset: ChartData<'pie', { key: string; value: number }[]> = {
    datasets: [
      {
        data: [],
      },
    ],
    labels: [],
  };

  maxTurnsDataset: ChartData<'pie', { key: string; value: number }[]> = {
    datasets: [
      {
        data: [],
      },
    ],
    labels: [],
  };

  pieChartPlugins = [ChartDataLabels];
  pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as 'bottom',
      },
      datalabels: {
        formatter: (value: { key: string; value: number }) => {
          return `${value.value} ${value.value === 1 ? 'game' : 'games'}`;
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const data = tooltipItem.dataset.data;
            let total = 0;
            for (let i = 0; i < data.length; i++) {
              total += data[i].value;
            }
            const percentage = (tooltipItem.parsed / total) * 100;
            return `${tooltipItem.parsed} ${tooltipItem.parsed === 1 ? 'game' : 'games'} (${percentage.toFixed(2)}%)`;
          },
        },
      },
    },
  };

  mostUsedWordsDataset: ChartData<'bar', { key: string; value: number }[]> = {
    datasets: [
      {
        data: [],
      },
    ],
    labels: [],
  };

  winsByTurnDataset: ChartData<'bar', { key: string; value: number }[]> = {
    datasets: [],
    labels: [
      'Turn 1',
      'Turn 2',
      'Turn 3',
      'Turn 4',
      'Turn 5',
      'Turn 6',
      'Turn 7',
      'Turn 8',
    ],
  };

  barChartPlugins = [ChartDataLabels];
  barChartOptions = {
    parsing: {
      xAxisKey: 'key',
      yAxisKey: 'value',
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as 'bottom',
      },
      datalabels: {
        enabled: false,
        formatter: () => {
          return '';
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            return `${tooltipItem.dataset.label ?? tooltipItem.label}: ${tooltipItem.parsed.y} ${tooltipItem.parsed.y === 1 ? 'game' : 'games'}`;
          },
        },
      },
    },
  };

  history: GameHistoryModel[] = [];
  gameDetails: { [key: number]: GetCurrentGameDto } = {};
  loadingDetails: { [key: number]: boolean } = {};

  expandedGameId: number | null = null;

  constructor(
    private gameService: GameService,
    private destroyRef: DestroyRef,
  ) {
    this.loadBatch();
  }

  ngOnInit(): void {
    this.gameService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stats) => {
        this.stats = stats;

        this.fastestWinByTime = this.formatTimeSpan(
          this.stats?.fastestWinByTime?.duration.toString() ?? '-',
        );

        this.wordLengthDataset = this.wordLengthMapper(
          this.stats?.wordLengthDistribution,
        );

        this.maxTurnsDataset = this.maxTurnsMapper(
          this.stats?.turnDistribution,
        );

        this.mostUsedWordsDataset = this.mostUsedWordsMapper(
          this.stats?.usedWordDistribution,
        );

        this.winsByTurnDataset = this.populateTurnsToWinDataSet(
          this.stats?.winsByTurnDistribution,
        );
      });

    this.gameService
      .getFullHistory(1, 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stats) => {
        this.history = stats;
      });

    if (window.innerWidth < 440) this.viewToggle = true;
    else this.viewToggle = false;
  }

  wordLengthMapper(distributionList: WordLengthDistributionModel[]) {
    let mappedData = [];
    for (let i = 0; i < distributionList.length; i++) {
      mappedData.push({
        key: distributionList[i].wordLength,
        value: distributionList[i].count,
      });
    }
    return this.populateDataSet(mappedData, '-Letter');
  }

  maxTurnsMapper(distributionList: TurnDistributionModel[]) {
    let mappedData = [];
    for (let i = 0; i < distributionList.length; i++) {
      mappedData.push({
        key: distributionList[i].turn,
        value: distributionList[i].count,
      });
    }
    return this.populateDataSet(mappedData, '-Turn');
  }

  mostUsedWordsMapper(distributionList: WordDistributionModel[]) {
    let mappedData = [];
    for (let i = 0; i < distributionList.length; i++) {
      mappedData.push({
        key: distributionList[i].word,
        value: distributionList[i].count,
      });
    }
    return this.populateDataSet(mappedData, '');
  }

  populateDataSet(distribution: any[], labelString: string) {
    let arrayData = [];
    let labels = [];
    for (let i = 0; i < distribution.length; i++) {
      let data = {
        key: distribution[i].key,
        value: distribution[i].value,
      };
      arrayData.push(data);
      labels.push(data.key + labelString);
    }
    return {
      datasets: [
        {
          data: arrayData,
        },
      ],
      labels: labels,
    };
  }

  populateTurnsToWinDataSet(distribution: any[]) {
    let dataset = [];
    for (let i = 0; i < distribution.length; i++) {
      let dataArray = {
        label: `${distribution[i].wordLength}-Letter`,
        data: [] as any,
      };
      for (let f = 0; f < distribution[i].turnsToWinDistribution.length; f++) {
        let data = {
          key: `Turn ${distribution[i].turnsToWinDistribution[f].turns}`,
          value: distribution[i].turnsToWinDistribution[f].winCount,
        };
        dataArray.data.push(data);
      }
      dataset.push(dataArray);
    }

    return { datasets: dataset };
  }

  viewGameDetails(gameId: number) {
    if (this.expandedGameId === gameId) {
      this.expandedGameId = null;
      return;
    }

    this.expandedGameId = gameId;

    if (!this.gameDetails[gameId] && !this.loadingDetails[gameId]) {
      this.loadingDetails[gameId] = true;
      this.gameService
        .getGameDetails(gameId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (details) => {
            this.gameDetails[gameId] = details;
            this.loadingDetails[gameId] = false;
          },
          error: () => {
            this.loadingDetails[gameId] = false;
          },
        });
    }
  }

  toggleTableView() {
    this.viewToggle = !this.viewToggle;
  }

  toggleFlip() {
    this.flipToggle = !this.flipToggle;
  }

  getLetterClass(stateNumber: number): string {
    return this.gameService.getCellStateFromNumber(stateNumber);
  }

  formatTimeSpan(date: string): string {
    const [hours, minutes, seconds] = date.split(':').map(Number);
    let roundedSeconds = seconds.toFixed(2);
    let duration = `${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds ? roundedSeconds + 's' : ''}`;
    return duration;
  }

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  currentPage = 1;
  theEnd = false; // To stop requests when no data left

  nextBatch(event: any) {
    if (this.theEnd) return;
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    // If we are near the end of the currently loaded list
    if (end === total && total > 0) {
      this.currentPage++;
      this.loadBatch();
    }
  }

  loadBatch() {
    this.gameService
      .getFullHistory(this.currentPage, 20)
      .subscribe((newItems) => {
        if (newItems.length === 0 || newItems.length < 20) this.theEnd = true;
        this.history = [...this.history, ...newItems];
      });
  }
}
